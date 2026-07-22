import assert from "node:assert/strict";
import test from "node:test";
import contract from "../public/visuals/agent-core-3d/model-contract.json" with { type: "json" };
import legacy from "../public/visuals/agent-core/asset-manifest.json" with { type: "json" };

test("locks the approved custom-rig contract", () => {
  assert.deepEqual(contract.artboard, { width: 1672, height: 941 });
  assert.deepEqual(contract.anchors.socketScreen, legacy.anchors.socketCenter);
  assert.deepEqual(contract.anchors.dockScreen, legacy.anchors.dockCenter);
  assert.deepEqual(contract.gazeLimitsDegrees.yaw, [-70, 70]);
  assert.deepEqual(contract.gazeLimitsDegrees.pitch, [-25, 25]);
  assert.deepEqual(contract.gazeLimitsDegrees.roll, [-3, 3]);
  assert.equal(
    new Set([...contract.requiredNodes, ...contract.requiredBones]).size,
    contract.requiredNodes.length + contract.requiredBones.length,
  );
  assert.deepEqual(contract.forbidden, ["tripo", "meshy", "spline", "http://", "https://"]);
  const { forbidden, ...contractWithoutForbidden } = contract;
  assert.doesNotMatch(JSON.stringify(contractWithoutForbidden).toLowerCase(), /tripo|meshy|spline|https?:\/\//);
});
