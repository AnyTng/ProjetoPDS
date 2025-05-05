using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RESTful_API.Models;
using System.Text;
using System.Text.Json.Serialization;
using QuestPDF.Infrastructure;
using RESTful_API.Interface;
using RESTful_API.Service;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.Newtonsoft;

var builder = WebApplication.CreateBuilder(args);

// Configurar JWT
var key = Encoding.ASCII.GetBytes(
    builder.Configuration["JwtSettings:Secret"] ?? "chave-super-secreta");

// Connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Configurar licen�a do QuestPDF
QuestPDF.Settings.License = LicenseType.Community;

// DbContext
builder.Services.AddDbContext<PdsContext>(options =>
    options.UseSqlServer(connectionString));

// JWT Auth
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        RoleClaimType = "role"
    };
});

builder.Services.AddAuthorization();

// Configura��o JSON + Newtonsoft support for cycle handling
builder.Services
    .AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    })
    .AddNewtonsoftJson(opts =>
    {
        opts.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

// Swagger + Newtonsoft support
builder.Services.AddEndpointsApiExplorer();
builder.Services
    .AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Minha API PDS",
            Version = "v1",
            Description = "Documenta��o da API do Projeto PDS",
            Contact = new OpenApiContact
            {
                Name = "Nome da Equipa",
                Email = string.Empty,
            }
        });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "Autoriza��o JWT usando o esquema Bearer. Exemplo: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[] {}
            }
        });
    })
    .AddSwaggerGenNewtonsoftSupport();

// Servi�os da API
builder.Services.AddScoped<IEmailService, EmailService>();

// Hangfire configura��o
builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(connectionString));
builder.Services.AddHangfireServer();

// Servi�o da tarefa agendada
builder.Services.AddTransient<ServicoInterno>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
});

var app = builder.Build();

// Developer exceptions + Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Minha API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Hangfire dashboard
app.UseHangfireDashboard("/hangfire");

// Agendar tarefa di�ria �s 9h
RecurringJob.AddOrUpdate<ServicoInterno>(
    "tarefa-diaria",
    tarefa => tarefa.Executar(),
    "0 9 * * *",
    TimeZoneInfo.Local
);

app.MapControllers();
app.Run();
public partial class Program { }
