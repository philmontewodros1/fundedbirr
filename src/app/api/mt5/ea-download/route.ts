import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const EA_SCRIPT = `//+------------------------------------------------------------------+
//| FundedBirr Reporter EA                                           |
//| Reports balance & equity to FundedBirr every 5 minutes           |
//| https://fundedbirr.com                                           |
//+------------------------------------------------------------------+
#property strict
#property description "FundedBirr Auto Balance Reporter - reports your MT5 balance and equity to FundedBirr automatically."

string ReportURL    = "https://www.fundedbirr.com/api/mt5/self-report";
string MT5Login     = "";
string ReportSecret = "";
int    TimerInterval = 300; // seconds (5 minutes)

//+------------------------------------------------------------------+
int OnInit() {
   MT5Login = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   EventSetTimer(TimerInterval);
   Print("FundedBirr Reporter started. Login: ", MT5Login);
   Report();
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   EventKillTimer();
   Print("FundedBirr Reporter stopped.");
}

//+------------------------------------------------------------------+
void OnTimer() {
   Report();
}

//+------------------------------------------------------------------+
void Report() {
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity  = AccountInfoDouble(ACCOUNT_EQUITY);

   if (balance <= 0 || equity <= 0) return;

   string body = "{";
   StringConcatenate(body,
      "\\"balance\\":", DoubleToString(balance, 2), ",",
      "\\"equity\\":", DoubleToString(equity, 2)
   );
   StringConcatenate(body, "}");

   string headers = "Content-Type: application/json\\r\\n";
   StringConcatenate(headers, "x-mt5-login: ", MT5Login, "\\r\\n");
   StringConcatenate(headers, "x-report-secret: ", ReportSecret, "\\r\\n");

   char postData[];
   char resultData[];
   string resultHeaders;
   StringToCharArray(body, postData, 0, StringLen(body));

   int res = WebRequest("POST", ReportURL, headers, 5000, postData, resultData, resultHeaders);

   if (res == -1) {
      int err = GetLastError();
      if (err == 4060) {
         Print("ERROR: Add '", ReportURL, "' to WebRequest URLs in Tools > Options > Expert Advisors");
      } else {
         Print("WebRequest failed. Error: ", err);
      }
   } else {
      Print("Reported: balance=", DoubleToString(balance, 2), " equity=", DoubleToString(equity, 2));
   }
}
//+------------------------------------------------------------------+`

export async function GET() {
  return new NextResponse(EA_SCRIPT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="FundedBirr_Reporter.mq5"',
      'Cache-Control': 'no-cache',
    },
  })
}
