import { DContainer } from "./primitives/DContainer";
import { DText } from "./primitives/DText";
import { DButton } from "./primitives/DButton";
import { DList } from "./primitives/DList";
import { DAlert } from "./primitives/DAlert";
import { DGrid } from "./primitives/DGrid";
import { DBadge } from "./primitives/DBadge";
import { DDivider } from "./primitives/DDivider";
import { DProgress } from "./primitives/DProgress";
import { DStat } from "./primitives/DStat";
import { DInput } from "./primitives/DInput";
import { DAvatar } from "./primitives/DAvatar";
import { DChip } from "./primitives/DChip";
import { DAccordion } from "./primitives/DAccordion";
import { DTimeline } from "./primitives/DTimeline";
import { DVendorCard } from "./primitives/DVendorCard";
import { DTabs } from "./primitives/DTabs";
import { DCarousel } from "./primitives/DCarousel";
import { DMetric } from "./primitives/DMetric";
import { DBanner } from "./primitives/DBanner";
import { DStepIndicator } from "./primitives/DStepIndicator";
import { DEmptyState } from "./primitives/DEmptyState";
import { DForm } from "./primitives/DForm";

const COMPONENT_MAP = {
  container: DContainer,
  text: DText,
  button: DButton,
  list: DList,
  alert: DAlert,
  grid: DGrid,
  badge: DBadge,
  divider: DDivider,
  progress: DProgress,
  stat: DStat,
  input: DInput,
  avatar: DAvatar,
  chip: DChip,
  accordion: DAccordion,
  timeline: DTimeline,
  vendorCard: DVendorCard,
  tabs: DTabs,
  carousel: DCarousel,
  metric: DMetric,
  banner: DBanner,
  stepIndicator: DStepIndicator,
  emptyState: DEmptyState,
  form: DForm,
};

export function DynamicRenderer({ schema, actions, onAction, onInputChange, formData }) {
  if (!schema || !Array.isArray(schema)) return null;

  return (
    <div className="dynamic-ui">
      {schema.map((node, index) => (
        <RenderNode
          key={index}
          node={node}
          actions={actions}
          onAction={onAction}
          onInputChange={onInputChange}
          formData={formData}
        />
      ))}
    </div>
  );
}

function RenderNode({ node, actions, onAction, onInputChange, formData }) {
  if (!node || !node.type) return null;

  const Component = COMPONENT_MAP[node.type];
  if (!Component) return null;

  const childElements = node.children?.map((child, i) => (
    <RenderNode
      key={i}
      node={child}
      actions={actions}
      onAction={onAction}
      onInputChange={onInputChange}
      formData={formData}
    />
  ));

  return (
    <Component
      {...(node.props || {})}
      actions={actions}
      onAction={onAction}
      onInputChange={onInputChange}
      formData={formData}
    >
      {childElements}
    </Component>
  );
}
