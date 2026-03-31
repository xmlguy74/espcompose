import 'dotenv/config';
import { Display, Image, useRef } from '@esphome/compose';
import { UI } from './lvgl';
import { Waveshare_ESP32P4_WIFI6_Touch_LCD_10_1 } from './hardware';

function App() {
  const display = useRef<Display>();
  const buttonBg = useRef<Image>();

  return (
    <esphome
      name="espcompose-demo"
      comment="An ESPHome Compose device"
    >
      <wifi ssid={process.env.WIFI_SSID} password={process.env.WIFI_PASSWORD} />

      <api
        encryption={{
          key: process.env.AP_ENCRYPTION
        }}
      />

      <ota
        platform="esphome"
        password={process.env.OTA_PASSWORD}
      />

      <logger level="DEBUG" hardwareUart="UART0" />

      <image ref={buttonBg} file="../src/assets/button.jpg" type="RGB565" resize="160x80" />

      <Waveshare_ESP32P4_WIFI6_Touch_LCD_10_1 display={display} />
      <UI display={display} buttonBg={buttonBg} />

    </esphome>
  );
}

export default <App />;
