using System.Text.Json;
using AudioCrawler.Models;
using AudioCrawler.Services;

// Load config
var configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "appsettings.json");
if (!File.Exists(configPath))
{
    configPath = "appsettings.json";
}

var configJson = File.ReadAllText(configPath);
var config = JsonDocument.Parse(configJson);
var connString = config.RootElement.GetProperty("ConnectionStrings").GetProperty("MySQL").GetString()!;
var crawlerConfig = config.RootElement.GetProperty("Crawler");

var baseUrl = crawlerConfig.GetProperty("BaseUrl").GetString()!;
var delayMs = crawlerConfig.GetProperty("DelayMs").GetInt32();
var userAgent = crawlerConfig.GetProperty("UserAgent").GetString()!;

Console.WriteLine("==============================================");
Console.WriteLine("  Audio Truyen Crawler - audiotruyenfull.com  ");
Console.WriteLine("==============================================");
Console.WriteLine();

using var db = new DatabaseService(connString);
await using var crawler = new CrawlerService(baseUrl, userAgent, delayMs);

// Check for command-line arguments
if (args.Length > 0)
{
    var command = args[0].ToLower();

    if (command == "genre" && args.Length > 1)
    {
        // Crawl genre: dotnet run genre tien-hiep
        var genreSlug = args[1];
        var maxPages = args.Length > 2 ? int.Parse(args[2]) : 3;
        await CrawlGenreAsync(genreSlug, maxPages);
    }
    else if (command == "book" && args.Length > 1)
    {
        // Crawl single book: dotnet run book https://audiotruyenfull.com/dau-la-dai-luc/
        await CrawlBookUrlAsync(args[1]);
    }
    else if (command == "queue")
    {
        // Process queue: dotnet run queue
        await ProcessQueueAsync();
    }
    else
    {
        PrintHelp();
    }
}
else
{
    PrintHelp();
}

// ===== FUNCTIONS =====

async Task CrawlGenreAsync(string genreSlug, int maxPages)
{
    Console.WriteLine($"[INFO] Crawling genre: {genreSlug} ({maxPages} pages)");
    var genreUrl = $"{baseUrl}/the-loai/tl-{genreSlug}/";
    
    var bookLinks = await crawler.CrawlGenreBookLinksAsync(genreUrl, maxPages);
    Console.WriteLine($"[INFO] Found {bookLinks.Count} books in genre");

    int success = 0, failed = 0;
    foreach (var link in bookLinks)
    {
        try
        {
            await CrawlBookUrlAsync(link);
            success++;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed: {ex.Message}");
            failed++;
        }
    }

    Console.WriteLine();
    Console.WriteLine($"[DONE] Genre crawl complete: {success} success, {failed} failed");
}

async Task CrawlBookUrlAsync(string url)
{
    try
    {
        var book = await crawler.CrawlBookAsync(url);
        if (book == null)
        {
            Console.WriteLine($"[ERROR] Failed to parse book from {url}");
            return;
        }

        // Check if already exists
        var existingId = await db.GetBookBySlugAsync(book.Slug);
        if (existingId != null)
        {
            Console.WriteLine($"[SKIP] Book already exists: {book.Title}");
            return;
        }

        // Insert author
        if (!string.IsNullOrEmpty(book.AuthorName))
        {
            book.AuthorId = await db.GetOrCreateAuthorAsync(book.AuthorName);
        }

        // Insert book
        var bookId = await db.InsertBookAsync(book);
        Console.WriteLine($"[OK] Inserted book #{bookId}: {book.Title}");

        // Link genres
        foreach (var genreName in book.Genres)
        {
            var genreId = await db.GetOrCreateGenreAsync(genreName);
            await db.LinkBookGenreAsync(bookId, genreId);
        }

        // Insert chapters
        foreach (var chapter in book.Chapters)
        {
            chapter.BookId = bookId;
            await db.InsertChapterAsync(chapter);
        }
        Console.WriteLine($"[OK] Inserted {book.Chapters.Count} chapters");

        await db.UpdateBookChapterCountAsync(bookId, book.Chapters.Count);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] {ex.Message}");
        throw;
    }
}

async Task ProcessQueueAsync()
{
    Console.WriteLine("[INFO] Processing crawl queue...");
    
    while (true)
    {
        var job = await db.GetNextPendingJobAsync();
        if (job == null)
        {
            Console.WriteLine("[INFO] No pending jobs in queue. Exiting.");
            break;
        }

        Console.WriteLine($"[INFO] Processing job #{job.Id}: {job.Url}");
        await db.UpdateJobStatusAsync(job.Id, "processing");

        try
        {
            await CrawlBookUrlAsync(job.Url);
            await db.UpdateJobStatusAsync(job.Id, "completed");
        }
        catch (Exception ex)
        {
            await db.UpdateJobStatusAsync(job.Id, "failed", ex.Message);
            Console.WriteLine($"[ERROR] Job #{job.Id} failed: {ex.Message}");
        }
    }
}

void PrintHelp()
{
    Console.WriteLine("Usage:");
    Console.WriteLine("  dotnet run genre <slug> [pages]  - Crawl genre (e.g., tien-hiep)");
    Console.WriteLine("  dotnet run book <url>            - Crawl single book URL");
    Console.WriteLine("  dotnet run queue                 - Process pending jobs from crawl_queue");
    Console.WriteLine();
    Console.WriteLine("Examples:");
    Console.WriteLine("  dotnet run genre tien-hiep 5");
    Console.WriteLine("  dotnet run book https://audiotruyenfull.com/dau-pha-thuong-khung/");
    Console.WriteLine("  dotnet run queue");
}
