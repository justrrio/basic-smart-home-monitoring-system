# Smart Home Monitor - IoT Dashboard

Dashboard monitoring untuk Smart Home Rental di Yogyakarta dengan 3 kamar dan 2 peralatan listrik (mesin cuci & pompa air).

## Arsitektur Sistem

```
┌─────────────┐     MQTT (1883)     ┌──────────────┐
│   ESP8266   │ ◄─────────────────► │   Mosquitto  │
│  (Kamar 1)  │                     │    Broker    │
└─────────────┘                     └──────┬───────┘
                                           │
┌─────────────┐     MQTT (1883)            │ WebSocket (9001)
│   ESP8266   │ ◄──────────────────────────┤
│  (Kamar 2)  │                            │
└─────────────┘                            ▼
                                    ┌──────────────┐
┌─────────────┐     MQTT (1883)     │   Dashboard  │
│   ESP8266   │ ◄──────────────────►│   (Browser)  │
│ (Mesin Cuci)│                     └──────────────┘
└─────────────┘
```

## Cara Menjalankan

### 1. Install & Jalankan MQTT Broker (Mosquitto)

**Windows:**
1. Download Mosquitto: https://mosquitto.org/download/
2. Install, lalu copy `mosquitto/mosquitto.conf` ke folder instalasi
3. Jalankan:
   ```cmd
   cd "C:\Program Files\mosquitto"
   mosquitto -c mosquitto.conf -v
   ```

**Atau pakai Docker:**
```bash
docker run -it -p 1883:1883 -p 9001:9001 -v ./mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto
```

### 2. Jalankan Dashboard

Karena dashboard menggunakan file CSS/JS terpisah, perlu local server:

**Opsi A - Python:**
```bash
cd dashboard
python -m http.server 8080
```
Buka: http://localhost:8080

**Opsi B - VS Code Live Server:**
1. Install extension "Live Server"
2. Klik kanan `dashboard/index.html` → "Open with Live Server"

**Opsi C - Node.js:**
```bash
npx serve dashboard
```

### 3. Konfigurasi Dashboard

1. Buka dashboard di browser
2. Klik ⚙️ (Settings)
3. Masukkan:
   - Alamat Broker: `localhost` (atau IP komputer jika akses dari device lain)
   - Port: `9001`
4. Klik "Simpan & Hubungkan"

### 4. Test dengan Simulator Mode

Tanpa hardware, kamu bisa test dengan Simulator:
1. Pilih mode "🔧 Simulator" di header
2. Pilih device (Kamar 1, Mesin Cuci, dll)
3. Set nilai dan klik "Publish"
4. Kembali ke "📊 Monitor" untuk lihat hasilnya

### 5. Upload Kode ke ESP8266 (Hardware)

**Untuk Kamar:**
1. Buka `microcontroller/kode-rumah.txt` di Arduino IDE
2. Edit konfigurasi WiFi dan IP broker:
   ```cpp
   const char* ssid = "NAMA_WIFI_KAMU";
   const char* password = "PASSWORD_WIFI";
   const char* mqtt_server = "192.168.1.xxx"; // IP komputer yang menjalankan Mosquitto
   ```
3. Untuk kamar berbeda, ubah topik:
   ```cpp
   const char* topicStatus    = "rumah/kamar2/status";  // kamar2, kamar3
   const char* topicLampuState= "rumah/kamar2/lampu";
   const char* topicLampuCmd  = "rumah/kamar2/lampu/set";
   ```
4. Upload ke ESP8266

**Untuk Alat Listrik:**
1. Buka `microcontroller/kode-alat-listrik-rumah.txt`
2. Edit konfigurasi WiFi dan topik sesuai alat (mesincuci/pompa)
3. Upload ke ESP8266

## Struktur Folder

```
IoT/
├── dashboard/
│   ├── index.html
│   ├── css/
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── header.css
│   │   ├── cards.css
│   │   ├── simulator.css
│   │   └── components.css
│   └── js/
│       ├── config.js
│       ├── state.js
│       ├── mqtt-client.js
│       ├── ui-rooms.js
│       ├── ui-appliances.js
│       ├── ui-system.js
│       ├── ui-mode.js
│       ├── simulator.js
│       ├── settings.js
│       ├── toast.js
│       └── app.js
├── microcontroller/
│   ├── kode-rumah.txt
│   └── kode-alat-listrik-rumah.txt
├── mosquitto/
│   └── mosquitto.conf
└── README.md
```

## MQTT Topics

| Device | Subscribe (Dashboard) | Publish (Dashboard) |
|--------|----------------------|---------------------|
| Kamar 1-3 | `rumah/kamar[1-3]/status` | - |
| Kamar 1-3 | `rumah/kamar[1-3]/lampu` | `rumah/kamar[1-3]/lampu/set` |
| Mesin Cuci | `rumah/mesincuci/arus` | - |
| Mesin Cuci | `rumah/mesincuci/relay/state` | `rumah/mesincuci/relay/set` |
| Pompa Air | `rumah/pompa/arus` | - |
| Pompa Air | `rumah/pompa/relay/state` | `rumah/pompa/relay/set` |

## Troubleshooting

**Dashboard tidak konek ke MQTT:**
- Pastikan Mosquitto berjalan dengan WebSocket (port 9001)
- Cek firewall tidak memblokir port 9001
- Buka browser console (F12) untuk lihat error

**ESP8266 tidak konek:**
- Pastikan WiFi SSID/password benar
- Pastikan IP broker benar dan bisa di-ping dari jaringan yang sama
- Cek Serial Monitor untuk debug