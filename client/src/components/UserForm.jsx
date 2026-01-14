export default function UserForm({ form, onChange, onSubmit, children }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
      </div>

      {children}
    </form>
  );
}
