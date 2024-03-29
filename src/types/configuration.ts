import { BaseResponseT } from "./baseResponse";

type AttributeTypeT = "number" | "text";

export type ProcessedAttributesGroupContentT = {
  display: string;
  type: AttributeTypeT;
};

export type ProcessedAttributesGroupT = {
  [key: string]: ProcessedAttributesGroupContentT;
};

export type ProcessedAttributesT = {
  core: ProcessedAttributesGroupT;
  router: ProcessedAttributesGroupT;
  algorithms: string[];
  observedAlgorithm: string | undefined;
  sinksSources: boolean;
};

export type AttributesGroupT = {
  [key: string]: AttributeTypeT;
};

export interface AttributesResponseT extends BaseResponseT {
  attributes?: {
    core: AttributesGroupT;
    router: AttributesGroupT;
    algorithms: string[];
    observedAlgorithm?: string;
    sinksSources: boolean;
  };
}

export type ColourConfig = {
  bounds: [number, number, number, number];
  colours: [string, string, string, string];
};

export type CoreRouterConfiguration = {
  [key: string]:
    | { Text: string }
    | { Fill: ColourConfig }
    | { ColouredText: [string, ColourConfig] };
};

export type RoutingConfigT = {
  routingConfig?: string;
  sinksSources: boolean;
};

export type Configuration = {
  coreConfig: CoreRouterConfiguration;
  routerConfig: CoreRouterConfiguration;
  routingConfig?: string;
  sinksSources: boolean;
};
