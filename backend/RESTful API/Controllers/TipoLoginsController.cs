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
    public class TipoLoginsController : ControllerBase
    {
        private readonly PdsContext _context;

        public TipoLoginsController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/TipoLogins
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoLogin>>> GetTipoLogins()
        {
            return await _context.TipoLogins.ToListAsync();
        }

        // GET: api/TipoLogins/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoLogin>> GetTipoLogin(int id)
        {
            var tipoLogin = await _context.TipoLogins.FindAsync(id);

            if (tipoLogin == null)
            {
                return NotFound();
            }

            return tipoLogin;
        }

        // PUT: api/TipoLogins/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoLogin(int id, TipoLogin tipoLogin)
        {
            if (id != tipoLogin.Idtlogin)
            {
                return BadRequest();
            }

            _context.Entry(tipoLogin).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoLoginExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/TipoLogins
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TipoLogin>> PostTipoLogin(TipoLogin tipoLogin)
        {
            _context.TipoLogins.Add(tipoLogin);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoLogin", new { id = tipoLogin.Idtlogin }, tipoLogin);
        }

        // DELETE: api/TipoLogins/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoLogin(int id)
        {
            var tipoLogin = await _context.TipoLogins.FindAsync(id);
            if (tipoLogin == null)
            {
                return NotFound();
            }

            _context.TipoLogins.Remove(tipoLogin);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoLoginExists(int id)
        {
            return _context.TipoLogins.Any(e => e.Idtlogin == id);
        }
    }
}
