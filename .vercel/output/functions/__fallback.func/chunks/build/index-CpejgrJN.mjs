import { defineComponent, ref, resolveComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

function useThemeColors() {
  return {
    PRIMARY: "#5B7BF5",
    PRIMARY_LT: "#EEF1FE",
    GOLD: "#C4A059",
    GOLD_LT: "#FBF6EC",
    TEXT: "#1A1A1A",
    MUTED: "#9B9B9B",
    BORDER: "#E8E8E8"
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SideBtn",
  __ssrInlineRender: true,
  props: {
    icon: {},
    label: {},
    active: { type: Boolean }
  },
  emits: ["click"],
  setup(__props) {
    const { PRIMARY, PRIMARY_LT, MUTED } = useThemeColors();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        style: {
          width: "56px",
          height: "56px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          cursor: "pointer",
          borderRight: __props.active ? `2px solid ${unref(PRIMARY)}` : "2px solid transparent",
          background: __props.active ? unref(PRIMARY_LT) : "transparent"
        }
      }, _attrs))}><span style="${ssrRenderStyle({ fontSize: "18px", lineHeight: 1 })}">${ssrInterpolate(__props.icon)}</span><span style="${ssrRenderStyle({
        fontSize: "9px",
        color: __props.active ? unref(PRIMARY) : unref(MUTED),
        fontWeight: 500,
        textAlign: "center",
        lineHeight: 1.2
      })}">${ssrInterpolate(__props.label)}</span></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/SideBtn.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SIDE_MENUS = [
  { key: "hall", icon: "\u{1F3E0}", label: "\uD640\uC9C0\uB3C4" },
  { key: "lounge", icon: "\u{1F465}", label: "\uB300\uAE30\uC2E4" },
  { key: "budget", icon: "\u{1F4CB}", label: "\uC6B0\uB9AC\uC608\uC0B0" },
  { key: "dict", icon: "\u{1F4D6}", label: "\uC6A9\uC5B4\uC0AC\uC804" },
  { key: "music", icon: "\u{1F3B5}", label: "\uC120\uACE1\uAE30" },
  { key: "profile", icon: "\u{1F464}", label: "\uD504\uB85C\uD544" }
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { PRIMARY, BORDER } = useThemeColors();
    const tab = ref("hall");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LayoutSideBtn = _sfc_main$1;
      const _component_HallHallPage = resolveComponent("HallHallPage");
      const _component_LoungeLoungePage = resolveComponent("LoungeLoungePage");
      const _component_BudgetBudgetPage = resolveComponent("BudgetBudgetPage");
      const _component_DictDictPage = resolveComponent("DictDictPage");
      const _component_MusicMusicPage = resolveComponent("MusicMusicPage");
      _push(`<div${ssrRenderAttrs(mergeProps({ style: {
        background: "#fff",
        display: "flex",
        height: "100vh",
        overflow: "hidden"
      } }, _attrs))}><div style="${ssrRenderStyle({
        width: "56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRight: `1px solid ${unref(BORDER)}`,
        background: "#fff",
        flexShrink: 0,
        zIndex: 10,
        paddingTop: "8px"
      })}"><div style="${ssrRenderStyle({
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: unref(PRIMARY),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "17px",
        fontWeight: 800,
        color: "#fff",
        cursor: "pointer",
        marginBottom: "6px"
      })}"> W </div><!--[-->`);
      ssrRenderList(unref(SIDE_MENUS), (m) => {
        _push(ssrRenderComponent(_component_LayoutSideBtn, {
          key: m.key,
          icon: m.icon,
          label: m.label,
          active: unref(tab) === m.key,
          onClick: ($event) => tab.value = m.key
        }, null, _parent));
      });
      _push(`<!--]--></div><div style="${ssrRenderStyle({
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0
      })}">`);
      if (unref(tab) === "hall") {
        _push(ssrRenderComponent(_component_HallHallPage, null, null, _parent));
      } else if (unref(tab) === "lounge") {
        _push(ssrRenderComponent(_component_LoungeLoungePage, null, null, _parent));
      } else if (unref(tab) === "budget") {
        _push(ssrRenderComponent(_component_BudgetBudgetPage, null, null, _parent));
      } else if (unref(tab) === "dict") {
        _push(ssrRenderComponent(_component_DictDictPage, null, null, _parent));
      } else if (unref(tab) === "music") {
        _push(ssrRenderComponent(_component_MusicMusicPage, null, null, _parent));
      } else if (unref(tab) === "profile") {
        _push(`<div style="${ssrRenderStyle({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#9B9B9B",
          fontSize: "14px"
        })}"> \uB9C8\uC774 \uD504\uB85C\uD544 (\uB85C\uADF8\uC778 \uD544\uC694) </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CpejgrJN.mjs.map
