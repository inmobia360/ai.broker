import { describe, it } from "node:test";
import assert from "node:assert";
import { evaluateSeatCapacity } from "../src/lib/db/repositories/users.ts";
import { validateTeamCapacity } from "../src/lib/branding/whiteLabel.ts";

describe("T4: Control Estricto de Plazas de Usuario (1 vs 5 Integrantes) (RF-P6, RF-P7)", () => {
  it("Plan Agencia Boutique permite hasta 5 usuarios y bloquea el sexto", () => {
    // 0 a 4 usuarios -> permitido
    assert.strictEqual(evaluateSeatCapacity(0, "boutique").allowed, true);
    assert.strictEqual(evaluateSeatCapacity(1, "boutique").allowed, true);
    assert.strictEqual(evaluateSeatCapacity(4, "boutique").allowed, true);

    // 5 usuarios ya registrados -> bloqueo al intentar registrar el sexto
    const resultBlocked = evaluateSeatCapacity(5, "boutique");
    assert.strictEqual(resultBlocked.allowed, false);
    assert.strictEqual(resultBlocked.maxAllowed, 5);
    assert.ok(resultBlocked.error?.includes("máximo de 5"));

    // 6 usuarios -> bloqueado
    assert.strictEqual(evaluateSeatCapacity(6, "boutique").allowed, false);
  });

  it("Plan Autónomo / Solo Agent permite estrictamente 1 usuario y bloquea el segundo", () => {
    // 0 usuarios -> permitido el primero
    assert.strictEqual(evaluateSeatCapacity(0, "solo").allowed, true);

    // 1 usuario ya registrado -> bloqueo al intentar registrar otro
    const resultBlocked = evaluateSeatCapacity(1, "solo");
    assert.strictEqual(resultBlocked.allowed, false);
    assert.strictEqual(resultBlocked.maxAllowed, 1);
    assert.ok(resultBlocked.error?.includes("máximo de 1"));
  });

  it("validateTeamCapacity valida el cupo en el modelo de marca blanca", () => {
    const createMember = (id: string) => ({
      id,
      name: `Agente ${id}`,
      email: `a${id}@test.com`,
      phone: "+34 600 000 000",
      role: "agente_asociado" as const,
      active: true
    });

    const validTeam = [createMember("1"), createMember("2")];
    assert.strictEqual(validateTeamCapacity(validTeam).valid, true);

    const fullTeam = [
      createMember("1"),
      createMember("2"),
      createMember("3"),
      createMember("4"),
      createMember("5")
    ];
    assert.strictEqual(validateTeamCapacity(fullTeam).valid, true);

    const exceededTeam = [
      ...fullTeam,
      createMember("6")
    ];
    assert.strictEqual(validateTeamCapacity(exceededTeam).valid, false);
  });
});
