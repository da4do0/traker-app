using Microsoft.EntityFrameworkCore;
using Api.model;

namespace Api
{
    public class ApiDbContext : DbContext
    {
        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Food> Foods { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<FoodIngredient> FoodIngredients { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<UserFood> UserFoods { get; set; }
        public DbSet<Misuration> Misurations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configurazione relazione Category 1:N Activity
            modelBuilder.Entity<Activity>()
                .HasOne(a => a.Category)
                .WithMany(c => c.Activities)
                .HasForeignKey(a => a.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configurazione relazione User 1:N Misuration
            modelBuilder.Entity<Misuration>()
                .HasOne(m => m.User)
                .WithMany(u => u.Misurations)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configurazione relazione N:N Food-Ingredient tramite FoodIngredient
            modelBuilder.Entity<FoodIngredient>()
                .HasKey(fi => new { fi.FoodId, fi.IngredientId }); // Chiave composta

            modelBuilder.Entity<FoodIngredient>()
                .HasOne(fi => fi.Food)
                .WithMany(f => f.FoodIngredients)
                .HasForeignKey(fi => fi.FoodId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FoodIngredient>()
                .HasOne(fi => fi.Ingredient)
                .WithMany(i => i.FoodIngredients)
                .HasForeignKey(fi => fi.IngredientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Activity>()
                .HasOne(a => a.User)
                .WithMany(u => u.Activities)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
} 