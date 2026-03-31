import { LightBinding, TriggerHandler, useHAEntity, useImage } from "@esphome/compose";
import { Button } from "@esphome/compose-ui"

type MyButtonProps = {
    text: string,
    onPress: TriggerHandler,
}

export const MyButton = (props: MyButtonProps) => {
    return (
        <Button
            size="lg"
            text={props.text}
            onPress={props.onPress}
        />

        // <lvgl-button
        //     lineRounded={true}
        //     text={props.text}
        //     bgColor={props.bgColor}
        //     textColor="0xAAAAAA"
        //     height="80"
        //     width="160"
        // >
        // </lvgl-button>
    );
}

export const MyImageButton = (props: MyButtonProps) => {

    const bgImage = useImage({
        file: "./assets/button.jpg",
        type: "RGB565",
        resize: "160x80"
    });

    return (
        <lvgl-button
            lineRounded={true}
            text={props.text}
            height="60"
            width="120"
            bgImageSrc={bgImage}
            x:custom={{
                onPress: props.onPress
            }}
        >
        </lvgl-button>
    );
}

type HALightProps = {
    entity: string,
    text: string,
}

export const HALight = (props: HALightProps) => {
    const entity = useHAEntity(props.entity) as LightBinding;
    return (
        <MyImageButton
            text={props.text}
            onPress={() => {
                entity.toggle();
            }}
        />
    )
}
