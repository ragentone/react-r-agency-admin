declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // Für Composition API mit defineComponent
  const component: DefineComponent<
    Record<string, any>, // Props
    Record<string, any>, // Events
    any, // Slots
    any, // Exposed
    any, // Emits
    any, // Props
    any, // Setup Context
    any // Render Function
  >;

  // Alternative für Options API
  // const component: ComponentOptions

  export default component;
}
