using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Kanban_API.Models
{
    public class CardsModel
    {
        public int CardID { get; set; }
        public int ListID { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string Text { get; set; }
    }
}