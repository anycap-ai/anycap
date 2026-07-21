import type React from "react";

import { formatAgentCoreValue, getAgentCoreStats } from "./agent-core-stats";
import styles from "./agent-core.module.css";

export type CapabilityTelemetryProps = {
  connected: boolean;
  statusRef: React.RefObject<HTMLSpanElement | null>;
  valueRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  fillRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
};

const telemetryCells = Array.from({ length: 12 });

export function CapabilityTelemetry({
  connected,
  statusRef,
  valueRefs,
  fillRefs,
}: CapabilityTelemetryProps) {
  const stats = getAgentCoreStats();

  return (
    <section
      className={`${styles.telemetry} ${styles.awaitingVisual}`}
      aria-label="Capability telemetry"
    >
      <p className={styles.telemetryStatus}>
        Core status /{" "}
        <span ref={statusRef}>{connected ? "Connected" : "Awaiting"}</span>
      </p>

      <div className={styles.telemetryRows}>
        {stats.map((stat, rowIndex) => (
          <div key={stat.id} className={styles.telemetryRow}>
            <div className={styles.telemetryLabelRow}>
              <span>{stat.label}</span>
              <span
                ref={(node) => {
                  valueRefs.current[rowIndex] = node;
                }}
                className={styles.telemetryValue}
              >
                {connected ? formatAgentCoreValue(stat.value) : "00"}
              </span>
            </div>
            <span className={styles.telemetryCells} aria-hidden="true">
              {telemetryCells.map((_, cellIndex) => {
                const isValueCell = connected && cellIndex < stat.value;
                const fillIndex = rowIndex * telemetryCells.length + cellIndex;

                return (
                  <span
                    key={cellIndex}
                    ref={(node) => {
                      fillRefs.current[fillIndex] = node;
                    }}
                    className={`${styles.telemetryCell}${
                      isValueCell ? ` ${styles.telemetryCellConnected}` : ""
                    }`}
                  />
                );
              })}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
