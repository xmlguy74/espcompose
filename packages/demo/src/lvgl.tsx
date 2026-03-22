import { Button, Display, ESPCompose, Ref, Screen, Text, VStack } from "@esphome/compose";

type UIProps = {
    display: Ref<Display>,
}

export const UI = (props: UIProps) => {
    
    return <>
        <lvgl
            byteOrder="little_endian"
            bufferSize="100%"
            drawRounding={2}
            displays={[
                props.display
            ]}
        >
            <Screen>
                <VStack height="100%" width="100%">
                    <Text text="Hello World!" />
                    <Button text="Click Me" />
                </VStack>
            </Screen>
        </lvgl>
    </>
}
