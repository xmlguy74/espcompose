/**
 * Sample project: script-device
 *
 * Demonstrates the function-as-script authoring pattern.
 * Top-level `function` declarations are automatically converted to ESPHome
 * script: components by the compiler. Arrow function constants are
 * compile-time helpers only and do not become scripts.
 */
import { ESPCompose, delay, logger } from '@esphome/compose';

/**
 * Named script: greet
 * Logs a greeting and waits 500 ms.
 */
function greet(): void {
  logger.log('Hello from ESPCompose!');
  delay(500);
}

/**
 * Named script: startUp
 * Logs startup messages with an if/else branch.
 */
function startUp(): void {
  logger.log('Device starting up', 'INFO');
  if (1 > 0) {
    delay(100);
    logger.log('System ready');
  }
}

export default (
  <esphome name="script-device" comment="Device using function-as-script authoring">
    <esp32 board="esp32dev" framework={{ type: 'esp-idf' }} />
    <wifi ssid="HomeWifi" password="s3cr3t!!" />
    <api />
    <logger level="INFO" />
    <binary_sensor
      platform="gpio"
      pin={4}
      name="Button"
      onPress={greet}
      onRelease={() => { delay(100); }}
    />
  </esphome>
);
