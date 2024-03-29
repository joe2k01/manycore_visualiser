import { useCallback, useReducer, useRef, useState } from "react";
import { useAppContext } from "../../App";
import { RoutingConfigT } from "../../types/configuration";
import { DisplayMapDispatchActionT, DisplayMapT } from "../../types/displayMap";
import { editSystem, updateSVG } from "../../utils/loadUtils";
import ElementSettings from "./ElementSettings";
import generateConfig from "./ElementSettings/generateConfig";
import RoutingSettings from "./RoutingSettings";
import SettingsButton from "./SettingsButton";
import "./checkbox.css";
import "./colour.css";
import "./number.css";
import "./select.css";

const Settings: React.FunctionComponent = () => {
  const ctx = useAppContext();
  const formRef = useRef<HTMLFormElement>(null);

  const algorithmSelectName = "algorithm-select";
  const sinksSourcesName = "sinks-sources-checkbox";

  const displayReducer: React.Reducer<
    DisplayMapT,
    DisplayMapDispatchActionT
  > = (state, action) => {
    return { ...state, [action.attribute]: action.display };
  };
  const [displayMap, dispatchDisplayMap] = useReducer(displayReducer, {});
  const [coreFillSelected, setCoreFillSelected] = useState<string>();
  const [routerFillSelected, setRouterFillSelected] = useState<string>();

  const handleSubmit = useCallback(
    ((ev) => {
      ev.preventDefault();

      if (formRef.current && ctx.attributes) {
        const coreConfig = generateConfig(
          formRef.current,
          "Cores",
          ctx.attributes.core,
          displayMap
        );

        const routerConfig = generateConfig(
          formRef.current,
          "Routers",
          ctx.attributes.router,
          displayMap
        );

        // Routing config is different from core/router so needs
        // to be handled with its own specific case.
        let routingConfig: RoutingConfigT = { sinksSources: false };
        const algorithmSelect = formRef.current[
          algorithmSelectName
        ] as HTMLInputElement | null;
        const sinksSources = formRef.current[
          sinksSourcesName
        ] as HTMLInputElement | null;

        if (algorithmSelect) {
          routingConfig.routingConfig =
            algorithmSelect.value === "None"
              ? undefined
              : algorithmSelect.value;
        }

        if (sinksSources) {
          routingConfig.sinksSources = sinksSources.checked;
        }

        updateSVG(
          {
            coreConfig,
            routerConfig,
            ...routingConfig,
          },
          ctx.setSVGStyle,
          ctx.setSVGInformation,
          ctx.setSVGSinksSources,
          ctx.setSVGViewbox
        );
      }
    }) as React.FormEventHandler<HTMLFormElement>,
    [formRef, ctx.attributes, displayMap]
  );

  return (
    <div
      className={`fixed z-20 bg-black text-white flex flex-col h-screen transition-transform duration-200 ease-in-out justify-between w-96 ${
        ctx.settings ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="overflow-y-scroll no-scrollbar px-2">
        <h3 className="block text-indigo-400 text-2xl">
          Visualisation Settings
        </h3>
        {ctx.attributes && (
          <form ref={formRef} onSubmit={handleSubmit}>
            <ElementSettings
              attributes={ctx.attributes.core}
              variant="Cores"
              dispatchDisplayMap={dispatchDisplayMap}
              fillSelected={coreFillSelected}
              setFillSelected={setCoreFillSelected}
            />
            <ElementSettings
              dispatchDisplayMap={dispatchDisplayMap}
              attributes={ctx.attributes.router}
              variant="Routers"
              fillSelected={routerFillSelected}
              setFillSelected={setRouterFillSelected}
            />
            <RoutingSettings
              algorithms={ctx.attributes.algorithms}
              observedAlgorithm={ctx.attributes.observedAlgorithm}
              algorithmSelectName={algorithmSelectName}
              sinksSourcesName={sinksSourcesName}
            />
          </form>
        )}
      </div>
      <div className="w-full grid grid-cols-2 grid-rows-2 gap-2 px-2 pb-2 pt-4">
        <SettingsButton text="Load new system" action={() => {}} />
        <SettingsButton
          text="Edit system"
          action={() => {
            editSystem(ctx);
          }}
        />
        <SettingsButton
          text="Apply"
          action={() => {
            if (formRef.current) {
              formRef.current.dispatchEvent(
                new Event("submit", { cancelable: false, bubbles: true })
              );
            }
          }}
        />
        <SettingsButton
          text="Close"
          action={() => {
            ctx.showSettings(false);
          }}
        />
      </div>
    </div>
  );
};

export default Settings;
