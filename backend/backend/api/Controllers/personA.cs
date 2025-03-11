using Microsoft.AspNetCore.Mvc;
using models;
using logicanegocios;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class personA : ControllerBase
    {
        // GET: api/<cliente>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<cliente>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<cliente>
        [HttpPost]
        public IActionResult Post([FromBody]Person p)
        {
            if (p != null)
            {
                personL.AddPerson(p);
                return Ok();
            }
            return NotFound();
        }

        // PUT api/<cliente>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<cliente>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
