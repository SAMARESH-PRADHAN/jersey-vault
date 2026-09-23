import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, Card, Input, Modal } from "@/components/ui/kit";
import { useApp } from "@/store/app";
import { RequireAuth } from "@/components/RequireAuth";
import type { Address } from "@/types";

export const Route = createFileRoute("/profile/address")({
  head: () => ({
    meta: [
      { title: "My Addresses — Jersey Fit" },
      { name: "description", content: "Manage your saved delivery addresses for Jersey Fit orders." },
      { property: "og:title", content: "My Addresses — Jersey Fit" },
      { property: "og:description", content: "Add, edit and set a default delivery address." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth title="Login to manage addresses">
      <AddressBook />
    </RequireAuth>
  ),
});

const blank = { name: "", phone: "", pincode: "", house: "", city: "", state: "", isDefault: false };
type Form = typeof blank;
type Errs = Partial<Record<keyof Form, string>>;

export function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Address | undefined;
  onSave: (a: Omit<Address, "id">, id?: string) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Form>(initial ? { ...initial } : blank);
  const [errors, setErrors] = useState<Errs>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Errs = {};
    if (form.name.trim().length < 3) err.name = "Enter the receiver's name.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) err.phone = "Enter a valid 10-digit number.";
    if (!/^\d{6}$/.test(form.pincode)) err.pincode = "Enter a 6-digit pincode.";
    if (form.house.trim().length < 5) err.house = "House / street is too short.";
    if (!form.city.trim()) err.city = "City is required.";
    if (!form.state.trim()) err.state = "State is required.";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave(form, initial?.id);
    if (!initial) setForm(blank);
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Full name" value={form.name} onChange={set("name")} error={errors.name} />
        <Input label="Phone" value={form.phone} onChange={set("phone")} error={errors.phone} inputMode="numeric" />
      </div>
      <Input label="House / flat / street" value={form.house} onChange={set("house")} error={errors.house} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Pincode" value={form.pincode} onChange={set("pincode")} error={errors.pincode} inputMode="numeric" />
        <Input label="City" value={form.city} onChange={set("city")} error={errors.city} />
        <Input label="State" value={form.state} onChange={set("state")} error={errors.state} />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          className="h-4 w-4 accent-[var(--color-primary)]" />
        Set as default address
      </label>
      <div className="flex gap-2 pt-1">
        <Button type="submit">{initial ? "Update address" : "Save address"}</Button>
        {onCancel ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button> : null}
      </div>
    </form>
  );
}

function AddressBook() {
  const { addresses, saveAddress, deleteAddress, setDefaultAddress } = useApp();
  const [editing, setEditing] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="shell py-12">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl">My <span className="text-gradient">Address</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">{addresses.length} saved address{addresses.length === 1 ? "" : "es"}</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add new</Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {addresses.length === 0 ? (
          <Card className="sm:col-span-2 py-14 text-center">
            <MapPin className="mx-auto h-8 w-8 text-lime" />
            <h2 className="mt-3 text-xl">No addresses yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add a delivery address to speed up checkout.</p>
            <Button className="mt-5" onClick={() => setAdding(true)}>Add address</Button>
          </Card>
        ) : (
          addresses.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-extrabold">{a.name}</p>
                  <p className="text-sm text-muted-foreground">{a.phone}</p>
                </div>
                {a.isDefault ? (
                  <span className="shrink-0 rounded-full bg-lime px-3 py-1 text-[10px] font-black uppercase text-lime-foreground">Default</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{a.house}, {a.city}, {a.state} — {a.pincode}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(a)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                {!a.isDefault ? (
                  <Button size="sm" variant="ghost" onClick={() => setDefaultAddress(a.id)}><Check className="h-3.5 w-3.5" /> Set default</Button>
                ) : null}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAddress(a.id)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add address" wide>
        <AddressForm onSave={(a) => { saveAddress(a); setAdding(false); }} onCancel={() => setAdding(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit address" wide>
        {editing ? (
          <AddressForm initial={editing} onSave={(a, id) => { saveAddress(a, id); setEditing(null); }} onCancel={() => setEditing(null)} />
        ) : null}
      </Modal>
    </div>
  );
}
