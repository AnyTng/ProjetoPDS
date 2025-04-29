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
using Hangfire; // ?? Hangfire
using Hangfire.SqlServer; // ?? Hangfire com SQL Server

var builder = WebApplication.CreateBuilder(args);

// Configurar JWT
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"] ?? "chave-super-secreta");

// Connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Configurar licença do QuestPDF
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

// Configuração JSON
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Minha API PDS",
        Version = "v1",
        Description = "Documentação da API do Projeto PDS",
        Contact = new OpenApiContact
        {
            Name = "Nome da Equipa",
            Email = string.Empty,
        }
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autorização JWT usando o esquema Bearer. Exemplo: \"Authorization: Bearer {token}\"",
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
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// Serviços da API
builder.Services.AddScoped<IEmailService, EmailService>();

// ?? Hangfire: registrar e configurar com SQL Server
builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(connectionString));
builder.Services.AddHangfireServer();

// ?? Serviço da tarefa agendada
builder.Services.AddTransient<ServicoInterno>();

// ?? CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
});

var app = builder.Build();

// ?? Swagger
if (app.Environment.IsDevelopment())
{
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

// ?? Hangfire dashboard (opcional)
app.UseHangfireDashboard("/hangfire");

// ?? Agendar tarefa diária às 2h
RecurringJob.AddOrUpdate<ServicoInterno>(
    "tarefa-diaria",
    tarefa => tarefa.Executar(),
    //"45 16 * * *", // Executa todos os dias às 16h42   ss mm hh
    "0 9 * * *", // Executa todos os dias às 9h
    TimeZoneInfo.Local
);

app.MapControllers();
app.Run();
