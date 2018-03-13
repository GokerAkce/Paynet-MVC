using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BerenOtoPaynet.Models
{
    public class Company
    {
        public string Name { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.Company"]; } }
        public string Mail { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.Mail"]; } }
        public string Phone { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.Phone"]; } }
        public string Address { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.Address"]; } }
    }
}