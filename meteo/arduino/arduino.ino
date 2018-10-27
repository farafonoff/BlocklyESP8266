#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>

const char* ssid     = "netis_24";
const char* password = "optanex14";

const char* host = "farafonoff.tk";
const uint16_t port = 11337;

WiFiClient* client;

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

boolean connectHub() {
  if (client && client->connected()) {
    return true;    
  }
  if (client) {
    delete client;
  }
  Serial.print("connecting to ");
  Serial.print(host);
  Serial.print(':');
  Serial.println(port);
  client = new WiFiClient();
  // Use WiFiClient class to create TCP connections
  if (!client->connect(host, port)) {
    Serial.println("connection failed");
    delay(100);
    delete client;
    return false;
  }
  char msg[50];
  sprintf(msg, "{ \"mac\": \"%s\", \"board\": \"arduino\" }", WiFi.macAddress().c_str());
  client->println(msg);
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(10);

  // We start by connecting to a WiFi network
  startWiFi();
  while(!connectHub()) {
    
  }
}

void loop() {
  
}

