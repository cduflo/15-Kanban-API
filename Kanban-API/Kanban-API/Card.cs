//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Kanban_API
{
    using Models;
    using System;
    using System.Collections.Generic;

    public partial class Card
    {
        public int CardID { get; set; }
        public int ListID { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string Text { get; set; }
    
        public virtual List List { get; set; }

        public void Update(CardsModel model)
        {
            ListID = model.ListID;
            Text = model.Text;
            CreatedDate = DateTime.Now;
        }
    }
}
