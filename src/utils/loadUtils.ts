import { invoke } from "@tauri-apps/api";
import { SVGResponseT, SVGT, SVGUpdateResponseT } from "../types/svg";
import { AppState } from "../App";
import { BaseResponseT } from "../types/baseResponse";
import { open } from "@tauri-apps/api/dialog";
import {
  AttributesGroupT,
  AttributesResponseT,
  Configuration,
  ProcessedAttributesGroupT,
  ProcessedAttributesT,
} from "../types/configuration";

async function openFilePickerDialog(ctx: AppState) {
  const file = await open({
    filters: [{ name: "", extensions: ["xml"] }],
  });

  if (file) {
    startProcessing(file as string, ctx);
  }
}

function startProcessing(filePath: string, ctx: AppState) {
  ctx.setProcessingInput(true);
  ctx.setTransform(undefined);
  invoke<BaseResponseT>("parse", { filePath }).then((res) => {
    if (res.status === "ok") {
      getSVG(ctx.setSVG);
      getAttributes(ctx.setAttributes);
    } else {
      // TODO: Propagate error
    }
    ctx.setProcessingInput(false);
  });
}

function getSVG(setSVG: React.Dispatch<React.SetStateAction<SVGT>>) {
  invoke<SVGResponseT>("get_svg").then((res) => {
    if (res.status === "ok") {
      setSVG(res.svg!);
    } else {
      // TODO: Propagate error
      console.log(`Error: ${res.message}`);
    }
  });
}

function updateSVG(
  configuration: Configuration,
  setSVGStyle: React.Dispatch<React.SetStateAction<SVGT>>,
  setSVGInformation: React.Dispatch<React.SetStateAction<SVGT>>,
  setSVGSinksSources: React.Dispatch<React.SetStateAction<SVGT>>,
  setSVGViewbox: React.Dispatch<React.SetStateAction<SVGT>>
) {
  invoke<SVGUpdateResponseT>("update_svg", { configuration }).then((res) => {
    if (res.status === "ok") {
      if (res.update!.style) {
        setSVGStyle(res.update!.style);
      }
      if (res.update!.informationGroup) {
        setSVGInformation(res.update!.informationGroup);
      }
      if (res.update!.viewBox) {
        setSVGViewbox(res.update!.viewBox);
      }
      if (res.update!.sinksSourcesGroup) {
        setSVGSinksSources(res.update!.sinksSourcesGroup);
      }
    } else {
      // TODO: Propagate error
      console.log(`Error: ${res.message}`);
    }
  });
}

function populateAttributesGroup(
  group: AttributesGroupT
): ProcessedAttributesGroupT {
  return Object.entries(group).reduce((acc, [key, type]) => {
    acc[key] = {
      // Skip @ at index 0
      display: key.charAt(1).toLocaleUpperCase() + key.slice(2),
      type,
    };

    return acc;
  }, {} as ProcessedAttributesGroupT);
}

function getAttributes(
  setAttributes: React.Dispatch<
    React.SetStateAction<ProcessedAttributesT | undefined>
  >
) {
  invoke<AttributesResponseT>("get_attributes").then((res) => {
    if (res.status === "ok" && res.attributes) {
      console.log(res);
      const processedAttributes: ProcessedAttributesT = {
        core: populateAttributesGroup(res.attributes.core),
        router: populateAttributesGroup(res.attributes.router),
        algorithms: res.attributes.algorithms,
        observedAlgorithm: res.attributes.observedAlgorithm,
        sinksSources: res.attributes.sinksSources,
      };

      if (!processedAttributes.observedAlgorithm) {
        processedAttributes.algorithms = processedAttributes.algorithms.filter(
          (algorithm) => algorithm !== "Observed"
        );
      }

      setAttributes(processedAttributes);
    } else {
      // TODO: Propagate error
    }
  });
}

export { openFilePickerDialog, startProcessing, getSVG, updateSVG };
