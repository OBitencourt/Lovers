
export default async function CouplePage ({ params }: {params: Promise<{ slug: string }>}) {
    const resolvedParams = await params;
    console.log(resolvedParams)

    return (
        <div>
            Slug do casal: {resolvedParams.slug}
        </div>
    )
}