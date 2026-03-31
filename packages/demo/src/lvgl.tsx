import { Display, Image, Ref, useHAEntity, useScript, delay, theme } from "@esphome/compose";
import {
    Button, Card, HStack, Screen, SliderField, SwitchField, Text, VStack,
    ThemeProvider, darkTheme, lightTheme,
} from "@esphome/compose-ui";
import { MyButton, MyImageButton } from "./button";

type UIProps = {
    display: Ref<Display>,
    buttonBg?: Ref<Image>,
}

export const UI = (props: UIProps) => {

    const officeLight = useHAEntity('light.office');

    const myScript = useScript(async () => {
        await delay(1000);
    });

    return <>
        <lvgl
            byteOrder="little_endian"
            bufferSize="100%"
            drawRounding={2}
            displays={[props.display]}
        >
            <ThemeProvider themes={{ dark: darkTheme, light: lightTheme }}>
                <Screen>
                    <VStack>
                        <Text variant="title" text="Theme Demo" />

                        <Card>
                            <SliderField
                                label="Brightness"
                                min={0}
                                max={255}
                                value={isNaN(officeLight.brightness) ? 0 : officeLight.brightness}
                                onChange={(args) => {
                                    officeLight.turnOn({ brightness: args.x })
                                }}
                            />

                            <SwitchField label="Power" />
                        </Card>

                        <Card>
                            <HStack>
                                <lvgl-label text={officeLight.stateText} />
                                <MyButton
                                    text={officeLight.isOn ? "Office Off" : "Office On"}
                                    onPress={() => { officeLight.toggle(); }}
                                />
                                <MyImageButton
                                    text={officeLight.isOn ? "Office Off" : "Office On"}
                                    bgImage={props.buttonBg}
                                    onPress={async () => {
                                        officeLight.toggle();
                                        await myScript();  //valid only because we know that myScript is from createScript. We can't just call any random function.
                                        officeLight.toggle();
                                    }}
                                />
                            </HStack>
                        </Card>

                        <HStack>
                            <Button text="Dark Theme" status="primary" onPress={() => { theme.select('dark'); }} />
                            <Button text="Light Theme" status="secondary" onPress={() => { theme.select('light'); }} />
                        </HStack>
                    </VStack>
                </Screen>
            </ThemeProvider>
        </lvgl>
    </>
}
