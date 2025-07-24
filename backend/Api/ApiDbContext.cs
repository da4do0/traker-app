using Microsoft.EntityFrameworkCore;
using Api.model;

namespace Api
{
    public class ApiDbContext : DbContext
    {
        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Food> Foods { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<UserFood> UserFoods { get; set; }
        public DbSet<Formato> Formati { get; set; }
        public DbSet<Element> Elements { get; set; }
    }
} 