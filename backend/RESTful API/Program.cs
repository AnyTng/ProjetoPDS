using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RESTful_API.Models;
using System.Text;
using System.Text.Json.Serialization; // Adicionar este using
using QuestPDF.Infrastructure; // importante!



var builder = WebApplication.CreateBuilder(args);

// Configurar JWT
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"] ?? "chave-super-secreta");

// Get ConnectionString from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");


// Configure a licen�a QuestPDF antes de qualquer uso
QuestPDF.Settings.License = LicenseType.Community;

// Add DbContext to the service container
builder.Services.AddDbContext<PdsContext>(options =>
    options.UseSqlServer(connectionString));

//  Autentica��o JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Em produ��o, deve ser true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, // Depende dos seus requisitos
        ValidateAudience = false, // Depende dos seus requisitos
        // Considerar adicionar valida��o de tempo de vida: ValidateLifetime = true,
        RoleClaimType = "role" // Mapeia a claim 'role' do token para User.IsInRole()
    };
});

builder.Services.AddAuthorization();

// --- MODIFICA��O AQUI ---
// Adicionar configura��o do JsonSerializer para ignorar ciclos
builder.Services.AddControllers().AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Pode adicionar outras op��es globais aqui, se necess�rio
        // options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
// --- FIM DA MODIFICA��O ---

builder.Services.AddEndpointsApiExplorer();

// ? CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173") // URL do seu frontend
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()); // Necess�rio se enviar cookies ou cabe�alho Authorization com credenciais
});

//  Swagger com suporte a JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Minha API PDS", // Ajustar conforme necess�rio
        Version = "v1",
        Description = "Documenta��o da API do Projeto PDS", // Ajustar
        Contact = new OpenApiContact
        {
            Name = "Nome da Equipa", // Ajustar
            Email = string.Empty, // Ajustar
            // Url = new Uri("https://example.com/contact"), // Opcional
        }
    });

    // Adicionar defini��o de seguran�a para Bearer (JWT)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autoriza��o JWT usando o esquema Bearer. Exemplo: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http, // Usar Http para Bearer
        Scheme = "bearer", // Esquema em min�sculas
        BearerFormat = "JWT"
    });

    // Adicionar requisito de seguran�a para opera��es que precisam de JWT
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
});


var app = builder.Build();

// Configure the HTTP request pipeline.
// Swagger apenas em desenvolvimento (recomendado)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Minha API V1");
        // Para aceder � UI do Swagger na raiz da aplica��o (ex: http://localhost:5159/)
        c.RoutePrefix = string.Empty;
    });
}

// HTTPS Redirection pode ser �til mesmo em desenvolvimento se configurar certificados
// app.UseHttpsRedirection();

// ? Aplica CORS antes de auth/authz
app.UseCors("AllowFrontend");

app.UseAuthentication(); // Adiciona middleware de autentica��o
app.UseAuthorization(); // Adiciona middleware de autoriza��o

app.MapControllers(); // Mapeia os atributos de rota nos controllers

app.Run();