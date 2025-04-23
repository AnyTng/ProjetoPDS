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


// Configure a licença QuestPDF antes de qualquer uso
QuestPDF.Settings.License = LicenseType.Community;

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
    options.RequireHttpsMetadata = false; // Em produção, deve ser true
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, // Depende dos seus requisitos
        ValidateAudience = false, // Depende dos seus requisitos
        // Considerar adicionar validação de tempo de vida: ValidateLifetime = true,
        RoleClaimType = "role" // Mapeia a claim 'role' do token para User.IsInRole()
    };
});

builder.Services.AddAuthorization();

// --- MODIFICAÇÃO AQUI ---
// Adicionar configuração do JsonSerializer para ignorar ciclos
builder.Services.AddControllers().AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Pode adicionar outras opções globais aqui, se necessário
        // options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
// --- FIM DA MODIFICAÇÃO ---

builder.Services.AddEndpointsApiExplorer();

// ? CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173") // URL do seu frontend
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()); // Necessário se enviar cookies ou cabeçalho Authorization com credenciais
});

//  Swagger com suporte a JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Minha API PDS", // Ajustar conforme necessário
        Version = "v1",
        Description = "Documentação da API do Projeto PDS", // Ajustar
        Contact = new OpenApiContact
        {
            Name = "Nome da Equipa", // Ajustar
            Email = string.Empty, // Ajustar
            // Url = new Uri("https://example.com/contact"), // Opcional
        }
    });

    // Adicionar definição de segurança para Bearer (JWT)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autorização JWT usando o esquema Bearer. Exemplo: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http, // Usar Http para Bearer
        Scheme = "bearer", // Esquema em minúsculas
        BearerFormat = "JWT"
    });

    // Adicionar requisito de segurança para operações que precisam de JWT
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
        // Para aceder à UI do Swagger na raiz da aplicação (ex: http://localhost:5159/)
        c.RoutePrefix = string.Empty;
    });
}

// HTTPS Redirection pode ser útil mesmo em desenvolvimento se configurar certificados
// app.UseHttpsRedirection();

// ? Aplica CORS antes de auth/authz
app.UseCors("AllowFrontend");

app.UseAuthentication(); // Adiciona middleware de autenticação
app.UseAuthorization(); // Adiciona middleware de autorização

app.MapControllers(); // Mapeia os atributos de rota nos controllers

app.Run();