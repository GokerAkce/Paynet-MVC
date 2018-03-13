using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BerenOtoPaynet.Models
{
    public class PaynetConfig
    {
        public string PublicKey { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.PublicKey"]; } }
        public string SecretKey { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.SecretKey"]; } }
        public string Url { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.Url"]; } }
        public string TestUrl { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.TestUrl"]; } }
        public string LogoUrl { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.LogoUrl"]; } }
        public string AgentCode { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.AgentCode"]; } }
        public string Instalment { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.Instalment"]; } }
        public string Commission { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.Commission"]; } }
        public string TDS { get { return System.Configuration.ConfigurationManager.AppSettings["PaynetIV.Client.TDS"]; } }
    }
}