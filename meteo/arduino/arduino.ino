#include "SSD1306Wire.h"

#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <DHTesp.h>
#include <NtpClientLib.h>

extern "C" {
#include "user_interface.h"
}
int WIFI_RETRY = 3;
const char* ssid     = "netis_24";
const char* password = "optanex14";

const char* host = "farafonoff.tk";
byte mhz19_cmd[9] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
unsigned char mhz19_response[9];
unsigned int ppm = 0;
float mhz19_temp = 0;
const uint16_t port = 11337;
unsigned char wcount = 0;
int8_t timeZone = 3;
int8_t minutesTimeZone = 0;
bool wifi = false;

//screen saving
int offsetX = 0;
int offsetY = 0;

//Constants
#define DHTPIN D3     // what pin we're connected to
#define DHTTYPE DHTesp::DHT22   // DHT 22  (AM2302)
SoftwareSerial mySerial(14, 12);
SSD1306Wire display(0x3c, D2, D1);
DHTesp dht;
//OLEDDisplayUi ui ( &display );

String ip = "NO CONN";

bool startWiFi() {
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  /* Explicitly set the ESP8266 to be a WiFi-client, otherwise, it by default,
     would try to act as both a client and an access-point and could cause
     network-issues with your other WiFi-devices on your WiFi-network. */
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int rtry = 0;
  while (WiFi.status() != WL_CONNECTED && rtry < WIFI_RETRY) {
    delay(500);
    Serial.print(".");
    ++rtry;
  }
  bool result = WiFi.status() == WL_CONNECTED;
  if (result) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    ip = WiFi.localIP().toString();    
  }
  return result;
}

boolean connectHub(WiFiClient& client) {
  Serial.print("connecting to ");
  Serial.print(host);
  Serial.print(':');
  Serial.println(port);
  // Use WiFiClient class to create TCP connections
  if (!client.connect(host, port)) {
    Serial.println("connection failed");
    delay(100);
    return false;
  }
  char msg[50];
  sprintf(msg, "{ \"mac\": \"%s\", \"board\": \"arduino\" }", WiFi.macAddress().c_str());
  Serial.println(msg);
  client.println(msg);
  return true;
}

void sendData(WiFiClient& client) {
  char msg[50];
  sprintf(msg, "{ \"type\": \"carbon\", \"carbon\": \"%d\", \"temp\": \"%f\" }", ppm, mhz19_temp);
  Serial.println(msg);
  client.println(msg);
}

void initDisplay() {
  display.init();

  display.flipScreenVertically();

  display.setContrast(255);
  display.clear();
}

void setup() {
  Serial.begin(9600);
  delay(50);
  Serial.println("=========BOOT=========");
  initDisplay();
  display.drawString(0,0, "BOOT\n");
  display.display();
  if (wifi) {
    wifi = startWiFi();
  }
  pinMode(DHTPIN, OUTPUT);
  digitalWrite(DHTPIN, LOW);
  delay(100);
  digitalWrite(DHTPIN, HIGH);
  delay(100);
  dht.setup(DHTPIN, DHTTYPE);
  //wifi_set_sleep_type(LIGHT_SLEEP_T);
  if (wifi) {
    NTP.begin ("pool.ntp.org", timeZone, true, minutesTimeZone);
    NTP.setInterval (63);
  }
}

void readMHZ19() {
  mySerial.write(mhz19_cmd, 9); //Запрашиваем данные у MH-Z19
  memset(mhz19_response, 0, 9); //Чистим переменную от предыдущих значений
  mySerial.readBytes(mhz19_response, 9); //Записываем свежий ответ от MH-Z19
  unsigned int i;
  byte crc = 0;//Ниже магия контрольной суммы
  for (i = 1; i < 8; i++) crc += mhz19_response[i];
  crc = 255 - crc;
  crc++;
  if ( !(mhz19_response[0] == 0xFF && mhz19_response[1] == 0x86 && mhz19_response[8] == crc) ) {
    Serial.println("CRC error: " + String(crc) + " / " + String(mhz19_response[8]));
    ESP.reset();
  }
  mhz19_temp = mhz19_response[4] - 44;
  ppm = 256 * (int)mhz19_response[2] + mhz19_response[3];
  /*Serial.print("ppm ");
  Serial.print(ppm);
  Serial.print("mhz_temp ");
  Serial.println(mhz19_temp);*/
}
TempAndHumidity lastValues;
void readDHT() {
   lastValues = dht.getTempAndHumidity();
}

void drawData1() {
  char out[30] = "";
  display.clear();
  int ltop = 0;
  if (wifi) {
    String ntpt = (NTP.getTimeDateString());
    display.drawString(offsetX,offsetY + 0,ip);
    ltop = 16;    
    display.drawString(offsetX,offsetY + ltop + 16, ntpt);
  }
  sprintf(out, "%d ppm", ppm);
  String temp = String(lastValues.temperature,0);
  String hum = String(lastValues.humidity,0);
  String s1 = temp+" C "+ hum + "%";
  char json[100];
  sprintf(json, "{ \"temp\": %s, \"hum\": %s, \"co2\": %d }", temp.c_str(), hum.c_str(), ppm);
  Serial.println(json);
  display.drawString(offsetX,offsetY + ltop, out);
  display.drawString(offsetX,offsetY + ltop + 8, s1);
  display.display(); 
}

void loop() {
  mySerial.begin(9600);
  readMHZ19();
  readDHT();
  drawData1();
  if (wifi && (wcount > 10 || wcount < 0)) {
    Serial.println("Sending data...");
    WiFiClient client;
    if (connectHub(client)) {
      sendData(client);
    }
    delay(50);
    client.stop();
    delay(50);
    Serial.println("end of loop");
    wcount = 0;
  }
  ++wcount;
  if (wcount %10 == 0) {
    offsetX = random(20);
    offsetY = random(20);
  }
  delay(1000);
}
