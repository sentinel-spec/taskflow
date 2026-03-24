import type React from 'react'

export default function WorkspaceSettingsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div>
			<main className="min-h-0 overflow-y-auto">{children}</main>
		</div>
	)
}
