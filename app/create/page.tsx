import CreateForm from "@/components/create-form";
import Header from "@/components/header";

export default function Create () {
    return (
        <main className="min-h-screen bg-linear-to-b from-pink-50 via-pink-100 to-rose-200 px-6 py-24">
            <Header />
            
            <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-extrabold text-rose-600 my-16 text-center">
                Crie sua página Lovers
            </h1>


            <CreateForm />
            </div>
        </main>
    )
}