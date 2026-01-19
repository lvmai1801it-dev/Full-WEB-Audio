using MySqlConnector;
using AudioCrawler.Models;

namespace AudioCrawler.Services;

public class DatabaseService : IDisposable
{
    private readonly string _connectionString;
    private MySqlConnection? _connection;

    public DatabaseService(string connectionString)
    {
        _connectionString = connectionString;
    }

    private async Task<MySqlConnection> GetConnectionAsync()
    {
        if (_connection == null || _connection.State != System.Data.ConnectionState.Open)
        {
            _connection = new MySqlConnection(_connectionString);
            await _connection.OpenAsync();
        }
        return _connection;
    }

    // ===== AUTHORS =====
    public async Task<int> GetOrCreateAuthorAsync(string name)
    {
        var conn = await GetConnectionAsync();
        var slug = CreateSlug(name);

        // Check if exists
        using var checkCmd = new MySqlCommand(
            "SELECT id FROM authors WHERE slug = @slug", conn);
        checkCmd.Parameters.AddWithValue("@slug", slug);
        var result = await checkCmd.ExecuteScalarAsync();
        if (result != null) return Convert.ToInt32(result);

        // Insert new
        using var insertCmd = new MySqlCommand(
            "INSERT INTO authors (name, slug) VALUES (@name, @slug); SELECT LAST_INSERT_ID();", conn);
        insertCmd.Parameters.AddWithValue("@name", name);
        insertCmd.Parameters.AddWithValue("@slug", slug);
        return Convert.ToInt32(await insertCmd.ExecuteScalarAsync());
    }

    // ===== GENRES =====
    public async Task<int> GetOrCreateGenreAsync(string name)
    {
        var conn = await GetConnectionAsync();
        var slug = CreateSlug(name);

        using var checkCmd = new MySqlCommand(
            "SELECT id FROM genres WHERE slug = @slug", conn);
        checkCmd.Parameters.AddWithValue("@slug", slug);
        var result = await checkCmd.ExecuteScalarAsync();
        if (result != null) return Convert.ToInt32(result);

        using var insertCmd = new MySqlCommand(
            "INSERT INTO genres (name, slug) VALUES (@name, @slug); SELECT LAST_INSERT_ID();", conn);
        insertCmd.Parameters.AddWithValue("@name", name);
        insertCmd.Parameters.AddWithValue("@slug", slug);
        return Convert.ToInt32(await insertCmd.ExecuteScalarAsync());
    }

    // ===== BOOKS =====
    public async Task<int?> GetBookBySlugAsync(string slug)
    {
        var conn = await GetConnectionAsync();
        using var cmd = new MySqlCommand("SELECT id FROM books WHERE slug = @slug", conn);
        cmd.Parameters.AddWithValue("@slug", slug);
        var result = await cmd.ExecuteScalarAsync();
        return result != null ? Convert.ToInt32(result) : null;
    }

    public async Task<int> InsertBookAsync(Book book)
    {
        var conn = await GetConnectionAsync();
        using var cmd = new MySqlCommand(@"
            INSERT INTO books (author_id, title, slug, description, thumbnail_url, source_url, total_chapters)
            VALUES (@author_id, @title, @slug, @description, @thumbnail_url, @source_url, @total_chapters);
            SELECT LAST_INSERT_ID();", conn);

        cmd.Parameters.AddWithValue("@author_id", book.AuthorId ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@title", book.Title);
        cmd.Parameters.AddWithValue("@slug", book.Slug);
        cmd.Parameters.AddWithValue("@description", book.Description ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@thumbnail_url", book.ThumbnailUrl ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@source_url", book.SourceUrl ?? (object)DBNull.Value);
        cmd.Parameters.AddWithValue("@total_chapters", book.TotalChapters);

        return Convert.ToInt32(await cmd.ExecuteScalarAsync());
    }

    public async Task UpdateBookChapterCountAsync(int bookId, int count)
    {
        var conn = await GetConnectionAsync();
        using var cmd = new MySqlCommand(
            "UPDATE books SET total_chapters = @count WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("@count", count);
        cmd.Parameters.AddWithValue("@id", bookId);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task LinkBookGenreAsync(int bookId, int genreId)
    {
        var conn = await GetConnectionAsync();
        using var cmd = new MySqlCommand(
            "INSERT IGNORE INTO book_genres (book_id, genre_id) VALUES (@book_id, @genre_id)", conn);
        cmd.Parameters.AddWithValue("@book_id", bookId);
        cmd.Parameters.AddWithValue("@genre_id", genreId);
        await cmd.ExecuteNonQueryAsync();
    }

    // ===== CHAPTERS =====
    public async Task<bool> ChapterExistsAsync(int bookId, int chapterIndex)
    {
        var conn = await GetConnectionAsync();
        using var cmd = new MySqlCommand(
            "SELECT 1 FROM chapters WHERE book_id = @book_id AND chapter_index = @index", conn);
        cmd.Parameters.AddWithValue("@book_id", bookId);
        cmd.Parameters.AddWithValue("@index", chapterIndex);
        return await cmd.ExecuteScalarAsync() != null;
    }

    public async Task InsertChapterAsync(Chapter chapter)
    {
        var conn = await GetConnectionAsync();
        using var cmd = new MySqlCommand(@"
            INSERT INTO chapters (book_id, title, chapter_index, audio_url, duration_seconds)
            VALUES (@book_id, @title, @chapter_index, @audio_url, @duration_seconds)
            ON DUPLICATE KEY UPDATE audio_url = @audio_url, title = @title", conn);

        cmd.Parameters.AddWithValue("@book_id", chapter.BookId);
        cmd.Parameters.AddWithValue("@title", chapter.Title);
        cmd.Parameters.AddWithValue("@chapter_index", chapter.ChapterIndex);
        cmd.Parameters.AddWithValue("@audio_url", chapter.AudioUrl);
        cmd.Parameters.AddWithValue("@duration_seconds", chapter.DurationSeconds);

        await cmd.ExecuteNonQueryAsync();
    }

    // ===== CRAWL QUEUE =====
    public async Task<CrawlJob?> GetNextPendingJobAsync()
    {
        var conn = await GetConnectionAsync();
        using var cmd = new MySqlCommand(@"
            SELECT id, url, status, error_message, created_at, processed_at 
            FROM crawl_queue WHERE status = 'pending' 
            ORDER BY created_at LIMIT 1", conn);

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new CrawlJob
            {
                Id = reader.GetInt32("id"),
                Url = reader.GetString("url"),
                Status = reader.GetString("status"),
                ErrorMessage = reader.IsDBNull(reader.GetOrdinal("error_message")) ? null : reader.GetString("error_message"),
                CreatedAt = reader.GetDateTime("created_at"),
                ProcessedAt = reader.IsDBNull(reader.GetOrdinal("processed_at")) ? null : reader.GetDateTime("processed_at")
            };
        }
        return null;
    }

    public async Task UpdateJobStatusAsync(int jobId, string status, string? errorMessage = null)
    {
        var conn = await GetConnectionAsync();
        using var cmd = new MySqlCommand(@"
            UPDATE crawl_queue SET status = @status, error_message = @error, processed_at = NOW()
            WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("@id", jobId);
        cmd.Parameters.AddWithValue("@status", status);
        cmd.Parameters.AddWithValue("@error", errorMessage ?? (object)DBNull.Value);
        await cmd.ExecuteNonQueryAsync();
    }

    // ===== HELPERS =====
    private static string CreateSlug(string text)
    {
        var vietnamese = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
        var ascii = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
        
        text = text.ToLowerInvariant();
        for (int i = 0; i < vietnamese.Length; i++)
        {
            text = text.Replace(vietnamese[i], ascii[i]);
        }
        
        // Also handle uppercase
        vietnamese = vietnamese.ToUpperInvariant();
        for (int i = 0; i < vietnamese.Length; i++)
        {
            text = text.Replace(vietnamese[i], ascii[i]);
        }

        text = System.Text.RegularExpressions.Regex.Replace(text, @"[^a-z0-9\s-]", "");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[\s-]+", "-");
        return text.Trim('-');
    }

    public void Dispose()
    {
        _connection?.Dispose();
    }
}
