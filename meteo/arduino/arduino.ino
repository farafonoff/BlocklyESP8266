#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
extern "C" {
#include "user_interface.h"
}

const char* ssid     = "netis_24";
const char* password = "optanex14";

const char* host = "farafonoff.tk";
byte mhz19_cmd[9] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
unsigned char mhz19_response[9];
unsigned int ppm = 0;
float mhz19_temp = 0;
const uint16_t port = 11337;
unsigned char wcount = 0;

SoftwareSerial mySerial(14, 12);

void startWiFi() {
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  /* Explicitly set the ESP8266 to be a WiFi-client, otherwise, it by default,
     would try to act as both a client and an access-point and could cause
     network-issues with your other WiFi-devices on your WiFi-network. */
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
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

void setup() {
  Serial.begin(115200);
  delay(50);
  Serial.println("=========BOOT=========");
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
  Serial.print("ppm ");
  Serial.print(ppm);
  Serial.print("mhz_temp ");
  Serial.println(mhz19_temp);
}

void loop() {
  system_rtc_mem_read(64, &wcount, sizeof(wcount));
  Serial.print("counter...");
  Serial.println(wcount);
  mySerial.begin(9600);
  readMHZ19();
  if (wcount > 10 || wcount < 0) {
    Serial.println("Sending data...");
    startWiFi();
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
  system_rtc_mem_write(64, &wcount, sizeof(wcount));
  if (wcount > 10 || wcount < 0) {
    ESP.deepSleep(1e6, WAKE_RF_DEFAULT);    
  } else {
    ESP.deepSleep(1e6, WAKE_RF_DISABLED);//10s    
  }
}

