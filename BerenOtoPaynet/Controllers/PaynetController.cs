using System.Collections.Generic;
using System.Web.Mvc;
using PaynetClient.Models;
using System.Collections;
using BerenOtoPaynet.Models;
using System.Globalization;
using System;

namespace BerenOtoPaynet.Controllers
{
    public class PaynetController : Controller
    {
        // GET: Paynet
        public ActionResult Index(string carikodu, string cariadi)
        {
            Company cmp = new Company();
            PaynetConfig pc = new PaynetConfig();

            ViewBag.Company = cmp.Name;
            ViewBag.Mail = cmp.Mail;
            ViewBag.Phone = cmp.Phone;
            ViewBag.Address = cmp.Address;
            ViewBag.LogoUrl = pc.LogoUrl;
            ViewBag.CustomerCode = carikodu;

            ViewBag.Desc = carikodu + " / " + cariadi;
            return View("HomePage");
        }

        [HttpPost]
        public ActionResult Odeme(string amount, string desc, string customerCode)
        {
            Company cmp = new Company();

            ViewBag.Company = cmp.Name;
            ViewBag.Mail = cmp.Mail;
            ViewBag.Phone = cmp.Phone;
            ViewBag.Address = cmp.Address;

            PaynetConfig pc = new PaynetConfig();

            ViewBag.PublicKey = pc.PublicKey;
            ViewBag.SecretKey = pc.SecretKey;
            ViewBag.Url = pc.Url;
            ViewBag.TestUrl = pc.TestUrl;
            ViewBag.LogoUrl = pc.LogoUrl;
            ViewBag.AgentCode = pc.AgentCode;
            ViewBag.Instalment = pc.Instalment;
            ViewBag.Commission = pc.Commission;
            ViewBag.TDS = pc.TDS;

            ViewBag.Desc = desc;
            ViewBag.Amount = amount;
            ViewBag.CustomerCode = customerCode;

            if (amount.Contains(","))
            {
                amount = amount.Replace(",", ".");
            }

            float sonuc;
            if (float.TryParse(amount, NumberStyles.Float, CultureInfo.InvariantCulture.NumberFormat, out sonuc))
            {
                float amount2 = sonuc;
                ViewBag.DataAmount = Convert.ToInt32(amount2 * 100);
            }
            else
            {
                ViewBag.ErrorMessage = "Tutar hatalı girildi.";
                return View("HomePage");
            }

            if(desc.Length == 3 && desc == " / ")
            {
                ViewBag.ErrorMessage = "Açıklama hatası meydana geldi, B2B üzerinden ödeme sayfasına tekrardan giriş yapınız.";
                return View("HomePage");
            }
                        
            return View();
        }

        [HttpPost]
        public ActionResult ChargeTransaction(string session_id, string token_id, string customerCode)
        {
            PaynetConfig pc = new PaynetConfig();
            ChargeParameters param = new ChargeParameters();
            
            param.session_id = session_id;
            param.token_id = token_id;
            param.transaction_type = TransactionType.Sales;
            param.reference_no = customerCode;

            PaynetClient.PaynetClient client = new PaynetClient.PaynetClient(pc.SecretKey, true);

           ChargeResponse response = client.ChargeTransaction(param);
            
            IDictionary requestForm = new Dictionary<string, object>();
            foreach (string key in Request.Form.AllKeys)
            {
                string value = Request.Form[key];
                requestForm.Add(key, value);
            }
            ViewBag.Response = response;
            ViewBag.RequestForm = requestForm;
            ViewBag.LogoUrl = pc.LogoUrl;

            return View("Result");
        }
    }
}