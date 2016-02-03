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
        [ResponseType(typeof(ListsModel))]
        public IHttpActionResult GetList(int id)
        {
            List list = db.Lists.Find(id);
            if (list == null)
            {
                return NotFound();
            }

            return Ok(Mapper.Map<ListsModel>(list));
        }

        // GET: api/Lists/5/Cards
        [Route("api/lists/{listId}/cards")]
        public IEnumerable<CardsModel> GetCardsForList(int listId)
        {
            var cards = db.Cards.Where(m => m.ListID == listId);
            return Mapper.Map<IEnumerable<CardsModel>>(cards);
        }

        // PUT: api/Lists/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutList(int id, ListsModel list)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != list.ListID)
            {
                return BadRequest();
            }
            //
            var dbList = db.Lists.Find(id);
            dbList.Update(list);
            db.Entry(dbList).State = EntityState.Modified;

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
        [ResponseType(typeof(ListsModel))]
        public IHttpActionResult PostList(ListsModel list)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var addlist = new List(list);

            db.Lists.Add(addlist);
            db.SaveChanges();

            list.ListID = addlist.ListID;
            list.CreatedDate = addlist.CreatedDate;

            return CreatedAtRoute("DefaultApi", new { id = list.ListID }, list);
        }

        // DELETE: api/Lists/5
        [ResponseType(typeof(ListsModel))]
        public IHttpActionResult DeleteList(int id)
        {
            List list = db.Lists.Find(id);
            if (list == null)
            {
                return NotFound();
            }

            var cards = db.Cards.Where(u => u.ListID == list.ListID);
            foreach (var u in cards)
            {
                db.Cards.Remove(u);
            }

            db.Lists.Remove(list);
            db.SaveChanges();

            return Ok(Mapper.Map<ListsModel>(list));
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