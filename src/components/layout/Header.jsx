export default function Header({ role }) {
    return (
        <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-200/80 shadow-sm">
            <h1 className="text-sm font-semibold text-slate-600">
                <span className="text-blue-600">{role} Hub</span>
            </h1>
        </header>
    );
}