using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using HtmlAgilityPack;
using Microsoft.Playwright;
using AudioCrawler.Models;

namespace AudioCrawler.Services;

public class CrawlerService : IAsyncDisposable
{
    private readonly string _baseUrl;
    private readonly int _delayMs;
    private readonly string _userAgent;
    private IPlaywright? _playwright;
    private IBrowser? _browser;
    private IBrowserContext? _context;

    public CrawlerService(string baseUrl, string userAgent, int delayMs)
    {
        _baseUrl = baseUrl.TrimEnd('/');
        _delayMs = delayMs;
        _userAgent = userAgent;
    }

    private async Task EnsureBrowserAsync()
    {
        if (_browser == null)
        {
            Console.WriteLine("[INFO] Launching Playwright browser...");
            _playwright = await Playwright.CreateAsync();
            _browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = true
            });
            _context = await _browser.NewContextAsync(new BrowserNewContextOptions
            {
                UserAgent = _userAgent,
                Locale = "vi-VN"
            });
            Console.WriteLine("[INFO] Browser ready");
        }
    }

    public async Task<string> FetchPageAsync(string url)
    {
        await EnsureBrowserAsync();
        await Task.Delay(_delayMs); // Rate limiting
        
        var page = await _context!.NewPageAsync();
        try
        {
            var response = await page.GotoAsync(url, new PageGotoOptions
            {
                WaitUntil = WaitUntilState.DOMContentLoaded,
                Timeout = 30000
            });
            
            // Wait a bit for dynamic content
            await page.WaitForTimeoutAsync(2000);
            
            var content = await page.ContentAsync();
            return content;
        }
        finally
        {
            await page.CloseAsync();
        }
    }

    public async Task<Book?> CrawlBookAsync(string bookUrl)
    {
        Console.WriteLine($"[INFO] Crawling book: {bookUrl}");
        
        var html = await FetchPageAsync(bookUrl);
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var book = new Book
        {
            SourceUrl = bookUrl,
            Slug = ExtractSlugFromUrl(bookUrl)
        };

        // Extract title
        var titleNode = doc.DocumentNode.SelectSingleNode("//h1[contains(@class,'entry-title')]");
        book.Title = HtmlDecode(titleNode?.InnerText.Trim() ?? "Unknown");
        Console.WriteLine($"[INFO] Title: {book.Title}");

        // Extract author
        var authorNode = doc.DocumentNode.SelectSingleNode("//span[contains(@class,'entry-meta')]/a[contains(@href,'tac-gia')]");
        if (authorNode == null)
        {
            authorNode = doc.DocumentNode.SelectSingleNode("//a[contains(@href,'tac-gia')]");
        }
        book.AuthorName = HtmlDecode(authorNode?.InnerText.Trim());
        Console.WriteLine($"[INFO] Author: {book.AuthorName ?? "Unknown"}");

        // Extract thumbnail
        var thumbNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class,'entry-content')]//img") 
                        ?? doc.DocumentNode.SelectSingleNode("//article//img");
        book.ThumbnailUrl = thumbNode?.GetAttributeValue("src", null);

        // Extract description
        var descNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class,'entry-content')]");
        if (descNode != null)
        {
            var descText = HtmlDecode(descNode.InnerText);
            // Clean up and truncate
            descText = Regex.Replace(descText, @"\s+", " ").Trim();
            book.Description = descText.Length > 1000 ? descText[..1000] + "..." : descText;
        }

        // Extract genres
        var genreNodes = doc.DocumentNode.SelectNodes("//a[contains(@href,'the-loai')]");
        if (genreNodes != null)
        {
            foreach (var node in genreNodes)
            {
                var genreName = HtmlDecode(node.InnerText.Trim());
                if (!string.IsNullOrWhiteSpace(genreName) && genreName.Length > 1 && !book.Genres.Contains(genreName))
                {
                    book.Genres.Add(genreName);
                }
            }
        }
        Console.WriteLine($"[INFO] Genres: {string.Join(", ", book.Genres)}");

        // Extract chapters with audio URLs
        await ExtractChaptersAsync(doc, bookUrl, book);
        Console.WriteLine($"[INFO] Chapters found: {book.Chapters.Count}");

        return book;
    }

    private async Task ExtractChaptersAsync(HtmlDocument doc, string bookUrl, Book book)
    {
        // Look for download links with audio URLs
        var downloadLinks = doc.DocumentNode.SelectNodes("//a[contains(@href,'megaurl') or contains(@href,'.mp3') or contains(text(),'Tải') or contains(text(),'Download')]");
        
        if (downloadLinks != null)
        {
            int index = 1;
            foreach (var link in downloadLinks)
            {
                var href = link.GetAttributeValue("href", "");
                var chapterTitle = HtmlDecode(link.InnerText.Trim());
                
                // Try to get chapter title from parent or sibling
                var parentLi = link.ParentNode;
                if (parentLi != null)
                {
                    var titleNode = parentLi.SelectSingleNode(".//text()[normalize-space()]");
                    if (titleNode != null && !string.IsNullOrWhiteSpace(titleNode.InnerText))
                    {
                        chapterTitle = HtmlDecode(titleNode.InnerText.Trim());
                    }
                }
                
                if (string.IsNullOrWhiteSpace(chapterTitle) || chapterTitle.Length < 3)
                {
                    chapterTitle = $"Chương {index}";
                }

                var audioUrl = ExtractAudioUrl(href);
                if (!string.IsNullOrEmpty(audioUrl))
                {
                    book.Chapters.Add(new Chapter
                    {
                        Title = chapterTitle,
                        ChapterIndex = index,
                        AudioUrl = audioUrl
                    });
                    index++;
                }
            }
        }

        // Also look for playlist data in scripts
        var scripts = doc.DocumentNode.SelectNodes("//script");
        if (scripts != null)
        {
            foreach (var script in scripts)
            {
                var content = script.InnerText;
                if (content.Contains("playlist") || content.Contains("tracks") || content.Contains("mp3"))
                {
                    // Try to extract URLs from script
                    var mp3Matches = Regex.Matches(content, @"https?://[^""'\s\\]+\.mp3[^""'\s\\]*", RegexOptions.IgnoreCase);
                    int scriptIndex = book.Chapters.Count + 1;
                    foreach (Match match in mp3Matches)
                    {
                        var url = match.Value.Trim('"', '\'', '\\');
                        url = url.Replace("\\/", "/"); // Unescape JSON
                        if (!book.Chapters.Any(c => c.AudioUrl == url))
                        {
                            book.Chapters.Add(new Chapter
                            {
                                Title = $"Chương {scriptIndex}",
                                ChapterIndex = scriptIndex,
                                AudioUrl = url
                            });
                            scriptIndex++;
                        }
                    }
                }
            }
        }

        book.TotalChapters = book.Chapters.Count;
    }

    private string? ExtractAudioUrl(string href)
    {
        if (string.IsNullOrEmpty(href)) return null;

        // Direct MP3 link
        if (href.Contains(".mp3"))
        {
            return href;
        }

        // megaurl.win format: url parameter is Base64 encoded
        if (href.Contains("megaurl") && href.Contains("url="))
        {
            try
            {
                var uri = new Uri(href);
                var query = HttpUtility.ParseQueryString(uri.Query);
                var encodedUrl = query["url"];
                
                if (!string.IsNullOrEmpty(encodedUrl))
                {
                    var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(encodedUrl));
                    return decoded;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WARN] Failed to decode URL: {ex.Message}");
            }
        }

        return null;
    }

    private string ExtractSlugFromUrl(string url)
    {
        var uri = new Uri(url);
        var path = uri.AbsolutePath.Trim('/');
        var segments = path.Split('/');
        return segments.LastOrDefault(s => !string.IsNullOrEmpty(s)) ?? "unknown";
    }

    private string HtmlDecode(string? text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        return System.Net.WebUtility.HtmlDecode(text);
    }

    public async Task<List<string>> CrawlGenreBookLinksAsync(string genreUrl, int maxPages = 5)
    {
        var bookLinks = new List<string>();
        
        for (int page = 1; page <= maxPages; page++)
        {
            var url = page == 1 ? genreUrl : $"{genreUrl}page/{page}/";
            Console.WriteLine($"[INFO] Crawling genre page: {url}");
            
            try
            {
                var html = await FetchPageAsync(url);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var links = doc.DocumentNode.SelectNodes("//h3[contains(@class,'entry-title')]/a")
                           ?? doc.DocumentNode.SelectNodes("//h2[contains(@class,'mh-loop-title')]/a");
                if (links == null || links.Count == 0) break;

                foreach (var link in links)
                {
                    var href = link.GetAttributeValue("href", "");
                    if (!string.IsNullOrEmpty(href) && !bookLinks.Contains(href))
                    {
                        bookLinks.Add(href);
                    }
                }

                Console.WriteLine($"[INFO] Found {links.Count} books on page {page}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Failed to crawl page {page}: {ex.Message}");
                break;
            }
        }

        return bookLinks;
    }

    public async ValueTask DisposeAsync()
    {
        if (_context != null) await _context.CloseAsync();
        if (_browser != null) await _browser.CloseAsync();
        _playwright?.Dispose();
    }
}
