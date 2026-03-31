import { Image, Ref, TriggerHandler } from "@esphome/compose";
import { Button } from "@esphome/compose-ui"

type MyButtonProps = {
    text: string,
    onPress: TriggerHandler,
    bgImage?: Ref<Image>
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
    return (
        <lvgl-button
            lineRounded={true}
            text={props.text}
            height="60"
            width="120"
            bgImageSrc={props.bgImage}
            x:custom={{
                onPress: props.onPress
            }}
        >
        </lvgl-button>
    );
}
