namespace AudioCrawler.Models;

public class Book
{
    public int Id { get; set; }
    public int? AuthorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? SourceUrl { get; set; }
    public int TotalChapters { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public List<Chapter> Chapters { get; set; } = new();
    public List<string> Genres { get; set; } = new();
    public string? AuthorName { get; set; }
}

public class Chapter
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int ChapterIndex { get; set; }
    public string AudioUrl { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Author
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

public class Genre
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}

public class CrawlJob
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending, processing, completed, failed
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}
