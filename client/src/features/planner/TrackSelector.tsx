import { Layers3, Route } from 'lucide-react';
import type { Track } from '../../types/domain';

interface TrackSelectorProps {
  roleName: string;
  tracks: Track[];
  selectedSlug: string | null;
  onSelect: (trackSlug: string | null) => void;
}

export function TrackSelector({ roleName, tracks, selectedSlug, onSelect }: TrackSelectorProps) {
  return (
    <section
      className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 sm:p-5"
      aria-labelledby="specialization-heading"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
          <Layers3 size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-indigo-700">
            Optional specialization
          </p>
          <h2 id="specialization-heading" className="mt-1 text-lg font-black text-slate-950">
            Choose a {roleName} track
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            A specialization assesses both the universal {roleName} requirements and the selected
            track requirements. Choose General role to assess only the universal requirements.
          </p>
        </div>
      </div>

      <fieldset className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="sr-only">Choose a specialization for {roleName}</legend>
        <TrackOption
          name="General role"
          summary={`Assess the universal requirements shared by every ${roleName} path.`}
          selected={selectedSlug === null}
          onSelect={() => onSelect(null)}
        />
        {tracks.map((track) => (
          <TrackOption
            key={track.slug}
            name={track.name}
            summary={track.summary || track.description}
            selected={selectedSlug === track.slug}
            onSelect={() => onSelect(track.slug)}
          />
        ))}
      </fieldset>
    </section>
  );
}

interface TrackOptionProps {
  name: string;
  summary: string;
  selected: boolean;
  onSelect: () => void;
}

function TrackOption({ name, summary, selected, onSelect }: TrackOptionProps) {
  return (
    <label
      className={`relative cursor-pointer rounded-xl border bg-white p-4 transition focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 ${
        selected
          ? 'border-indigo-600 shadow-[0_0_0_2px_rgb(79_70_229/10%)]'
          : 'border-slate-200 hover:border-indigo-300'
      }`}
    >
      <input
        type="radio"
        name="target-track"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${
            selected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Route size={14} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-extrabold text-slate-900">{name}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">{summary}</span>
        </span>
      </span>
      <span
        className={`absolute right-3 top-3 size-2.5 rounded-full border-2 ${
          selected
            ? 'border-indigo-700 bg-indigo-700 ring-4 ring-indigo-100'
            : 'border-slate-300 bg-white'
        }`}
        aria-hidden="true"
      />
    </label>
  );
}
