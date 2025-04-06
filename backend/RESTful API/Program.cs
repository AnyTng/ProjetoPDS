using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RESTful_API.Model;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configurar JWT
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"] ?? "chave-super-secreta");


// Get ConnectionString from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Add DbContext to the service container
builder.Services.AddDbContext<PdsContext>(options =>
    options.UseSqlServer(connectionString));

//  Autenticação JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // em produção mete true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        RoleClaimType = "role" // permite usar [Authorize(Roles = "...")]
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

//  Swagger com suporte a JWT
// Configure Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Minha API",
        Version = "v1",
        Description = "Documentação da Minha API",
        Contact = new OpenApiContact
        {
            Name = "Seu Nome",
            Email = "seu.email@example.com"
        }
    });
});

var app = builder.Build();

//  Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Minha API V1");
    // Optional: To serve the Swagger UI at the app's root
    c.RoutePrefix = string.Empty;
});
app.UseAuthentication(); // tem de vir antes de Authorization!
app.UseAuthorization();

app.MapControllers();

app.Run();