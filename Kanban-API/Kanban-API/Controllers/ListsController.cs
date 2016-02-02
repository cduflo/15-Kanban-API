using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using Kanban_API;
using Kanban_API.Models;
using AutoMapper;

namespace Kanban_API.Controllers
{
    public class ListsController : ApiController
    {
        private KanbanEntities db = new KanbanEntities();

        // GET: api/Lists
        public IEnumerable<ListsModel> GetLists()
        {
            return Mapper.Map<IEnumerable<ListsModel>>(db.Lists);
        }

        // GET: api/Lists/5
        [ResponseType(typeof(List))]
        public IHttpActionResult GetList(int id)
        {
            List list = db.Lists.Find(id);
            if (list == null)
            {
                return NotFound();
            }

            return Ok(list);
        }

        // PUT: api/Lists/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutList(int id, List list)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != list.ListID)
            {
                return BadRequest();
            }

            db.Entry(list).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ListExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Lists
        [ResponseType(typeof(List))]
        public IHttpActionResult PostList(List list)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Lists.Add(list);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = list.ListID }, list);
        }

        // DELETE: api/Lists/5
        [ResponseType(typeof(List))]
        public IHttpActionResult DeleteList(int id)
        {
            List list = db.Lists.Find(id);
            if (list == null)
            {
                return NotFound();
            }

            db.Lists.Remove(list);
            db.SaveChanges();

            return Ok(list);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ListExists(int id)
        {
            return db.Lists.Count(e => e.ListID == id) > 0;
        }
    }
}