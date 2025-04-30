using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;

namespace RESTful_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Route("api/[controller]")]
    public class LoginsController : ControllerBase
    {
        private readonly PdsContext _context;
        public LoginsController(PdsContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Login>>> GetLogins()
            => await _context.Logins.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Login>> GetLogin(int id)
        {
            var login = await _context.Logins.FindAsync(id);
            if (login == null) return NotFound();
            return login;
        }

        [HttpPost]
        public async Task<ActionResult<Login>> PostLogin(Login login)
        {
            _context.Logins.Add(login);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLogin), new { id = login.Idlogin }, login);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutLogin(int id, Login login)
        {
            if (id != login.Idlogin)
                return BadRequest();

            var existing = await _context.Logins.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Email             = login.Email;
            existing.HashPassword      = login.HashPassword;
            existing.TipoLoginIdtlogin = login.TipoLoginIdtlogin;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLogin(int id)
        {
            var login = await _context.Logins.FindAsync(id);
            if (login == null) return NotFound();
            _context.Logins.Remove(login);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
