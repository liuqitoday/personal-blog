import { visit } from 'unist-util-visit';

function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export default function remarkMermaid() {
	return (tree) => {
		visit(tree, 'code', (node, index, parent) => {
			if (node.lang !== 'mermaid' || parent == null || index == null) {
				return;
			}

			parent.children[index] = {
				type: 'html',
				value: `<div class="mermaid-wrapper"><div class="mermaid">${escapeHtml(node.value.trim())}</div></div>`,
			};
		});
	};
}
