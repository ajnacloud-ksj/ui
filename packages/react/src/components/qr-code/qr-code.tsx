"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { useRender } from "@base-ui/react/use-render";
import * as qrCode from "@zag-js/qr-code";
import {
  mergeProps,
  normalizeProps,
  type PropTypes,
  useMachine,
} from "@zag-js/react";
import { cva } from "class-variance-authority";
import {
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useId,
} from "react";

import { cn } from "@/utils";

export type UseQrCodeProps = Omit<qrCode.Props, "id"> & { id?: string };
export type UseQrCodeReturn = qrCode.Api<PropTypes>;

export function useQrCode(props: UseQrCodeProps = {}): UseQrCodeReturn {
  const id = useId();
  const dir = useDirection();
  const service = useMachine(qrCode.machine, {
    ...props,
    id: props.id ?? id,
    dir: props.dir ?? dir,
  });
  return qrCode.connect(service, normalizeProps);
}

const QrCodeContext = createContext<UseQrCodeReturn | null>(null);

export function useQrCodeContext(): UseQrCodeReturn {
  const context = useContext(QrCodeContext);
  if (!context)
    throw new Error(
      "QrCode parts must be used within QrCode.Root or QrCode.RootProvider.",
    );
  return context;
}

const QrCodeSizeContext = createContext<QrCodeSize>("md");
const frameStyles = cva("block", {
  variants: {
    size: {
      "2xs": "h-10 w-10",
      xs: "h-16 w-16",
      sm: "h-20 w-20",
      md: "h-[120px] w-[120px]",
      lg: "h-40 w-40",
      xl: "h-[200px] w-[200px]",
      "2xl": "h-60 w-60",
      full: "aspect-square h-auto w-full",
    },
  },
});
const overlayStyles = cva(
  "box-border flex items-center justify-center rounded-ajna-sm bg-ajna-background p-1",
  {
    variants: {
      size: {
        "2xs": "h-[calc(40px/3)] w-[calc(40px/3)]",
        xs: "h-[calc(64px/3)] w-[calc(64px/3)]",
        sm: "h-[calc(80px/3)] w-[calc(80px/3)]",
        md: "h-10 w-10",
        lg: "h-[calc(160px/3)] w-[calc(160px/3)]",
        xl: "h-[calc(200px/3)] w-[calc(200px/3)]",
        "2xl": "h-20 w-20",
        full: "aspect-square h-auto w-1/3",
      },
    },
  },
);

export type QrCodeSize =
  "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
interface QrCodeStyleProps {
  size?: QrCodeSize;
  unstyled?: boolean;
}
type DivProps = Omit<useRender.ComponentProps<"div">, "ref" | "defaultValue">;
export type QrCodeRootProps = Omit<DivProps, keyof UseQrCodeProps> &
  UseQrCodeProps &
  QrCodeStyleProps;
export type QrCodeRootProviderProps = DivProps &
  QrCodeStyleProps & { value: UseQrCodeReturn };
export type QrCodeFrameProps = Omit<useRender.ComponentProps<"svg">, "ref"> & {
  unstyled?: boolean;
};
export type QrCodePatternProps = Omit<useRender.ComponentProps<"path">, "ref">;
export type QrCodeOverlayProps = DivProps & { unstyled?: boolean };
export type QrCodeDownloadTriggerProps = Omit<
  useRender.ComponentProps<"button">,
  "ref"
> &
  qrCode.DownloadTriggerProps;
export interface QrCodeContextProps {
  children: (qrCode: UseQrCodeReturn) => ReactNode;
}

export const QrCodeRootProvider = forwardRef<
  HTMLDivElement,
  QrCodeRootProviderProps
>(function QrCodeRootProvider(
  { value, size = "md", unstyled = false, className, render, ...props },
  ref,
) {
  const element = useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      ...mergeProps(value.getRootProps(), {
        ...props,
        className: cn(
          !unstyled && "relative box-border font-ajna text-ajna-foreground",
          !unstyled && (size === "full" ? "w-full" : "w-fit"),
          className,
        ),
      }),
      "data-ajna-component": "qr-code",
      "data-slot": "qr-code",
      "data-size": size,
    },
  });
  return (
    <QrCodeContext.Provider value={value}>
      <QrCodeSizeContext.Provider value={size}>
        {element}
      </QrCodeSizeContext.Provider>
    </QrCodeContext.Provider>
  );
});

export const QrCodeRoot = forwardRef<HTMLDivElement, QrCodeRootProps>(
  function QrCodeRoot(
    {
      id,
      dir,
      getRootNode,
      value,
      defaultValue,
      ids,
      encoding,
      pixelSize,
      onValueChange,
      ...props
    },
    ref,
  ) {
    const api = useQrCode({
      id,
      dir,
      getRootNode,
      value,
      defaultValue,
      ids,
      encoding,
      pixelSize,
      onValueChange,
    });
    return <QrCodeRootProvider {...props} ref={ref} value={api} />;
  },
);

export const QrCodePattern = forwardRef<SVGPathElement, QrCodePatternProps>(
  function QrCodePattern({ render, ...props }, ref) {
    const api = useQrCodeContext();
    return useRender({
      defaultTagName: "path",
      render,
      ref,
      props: {
        ...mergeProps(api.getPatternProps(), {
          ...props,
        }),
        "data-ajna-component": "qr-code-pattern",
        "data-slot": "qr-code-pattern",
      },
    });
  },
);

export const QrCodeFrame = forwardRef<SVGSVGElement, QrCodeFrameProps>(
  function QrCodeFrame(
    {
      children = <QrCodePattern />,
      className,
      unstyled = false,
      render,
      ...props
    },
    ref,
  ) {
    const api = useQrCodeContext();
    const size = useContext(QrCodeSizeContext);
    return useRender({
      defaultTagName: "svg",
      render,
      ref,
      props: {
        ...mergeProps(api.getFrameProps(), {
          role: "img",
          "aria-label": "QR code",
          fill: "currentColor",
          ...props,
          className: cn(!unstyled && frameStyles({ size }), className),
          children,
        }),
        "data-ajna-component": "qr-code-frame",
        "data-slot": "qr-code-frame",
      },
    });
  },
);

export const QrCodeOverlay = forwardRef<HTMLDivElement, QrCodeOverlayProps>(
  function QrCodeOverlay(
    { className, unstyled = false, render, ...props },
    ref,
  ) {
    const api = useQrCodeContext();
    const size = useContext(QrCodeSizeContext);
    return useRender({
      defaultTagName: "div",
      render,
      ref,
      props: {
        ...mergeProps(api.getOverlayProps(), {
          ...props,
          className: cn(!unstyled && overlayStyles({ size }), className),
        }),
        "data-ajna-component": "qr-code-overlay",
        "data-slot": "qr-code-overlay",
      },
    });
  },
);

export const QrCodeDownloadTrigger = forwardRef<
  HTMLButtonElement,
  QrCodeDownloadTriggerProps
>(function QrCodeDownloadTrigger(
  { fileName, mimeType, quality, render, ...props },
  ref,
) {
  const api = useQrCodeContext();
  return useRender({
    defaultTagName: "button",
    render,
    ref,
    props: {
      ...mergeProps(
        api.getDownloadTriggerProps({ fileName, mimeType, quality }),
        {
          ...props,
        },
      ),
      "data-ajna-component": "qr-code-download-trigger",
      "data-slot": "qr-code-download-trigger",
    },
  });
});

function QrCodeContextConsumer({ children }: QrCodeContextProps) {
  return children(useQrCodeContext());
}

export const QrCode = {
  Root: QrCodeRoot,
  RootProvider: QrCodeRootProvider,
  Frame: QrCodeFrame,
  Pattern: QrCodePattern,
  Overlay: QrCodeOverlay,
  DownloadTrigger: QrCodeDownloadTrigger,
  Context: QrCodeContextConsumer,
};
