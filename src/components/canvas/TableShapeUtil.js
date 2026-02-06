
import { ShapeUtil, HTMLContainer, Rectangle2d, resizeBox } from 'tldraw';

export class TableShapeUtil extends ShapeUtil {
	static type = 'table';

	getDefaultProps() {
		return {
			w: 280,
			h: 200,
			tableName: 'new_table',
			fields: [
				{ name: 'id', type: 'serial', pk: true },
				{ name: 'created_at', type: 'timestamp' },
			],
			color: 'slate'
		};
	}

	getGeometry(shape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		});
	}

	component(shape) {
		const { tableName, fields } = shape.props;

		return (
			<HTMLContainer style={{ pointerEvents: 'all' }}>
				<div 
					className="w-full h-full flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white"
					style={{ 
						boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
						fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
					}}
				>
					{/* Table Header */}
					<div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
						<svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
						</svg>
						<span className="text-sm font-semibold text-gray-800 tracking-tight">{tableName}</span>
						<span className="ml-auto text-[10px] text-gray-400 font-medium">{fields.length} fields</span>
					</div>

					{/* Fields */}
					<div className="flex-1 overflow-y-auto">
						{fields.map((field, i) => (
							<div 
								key={i} 
								className="flex items-center px-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-center gap-2 flex-1 min-w-0">
									{field.pk && (
										<span className="text-amber-500 text-[10px] flex-shrink-0">
											<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
											</svg>
										</span>
									)}
									{field.fk && (
										<span className="text-blue-500 text-[10px] flex-shrink-0">
											<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
												<path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 10-5.656-5.656l-1.1 1.1" />
											</svg>
										</span>
									)}
									<span className="text-xs text-gray-700 truncate">{field.name}</span>
								</div>
								<span className="text-[10px] text-gray-400 font-mono ml-2 flex-shrink-0">{field.type}</span>
							</div>
						))}
					</div>
				</div>
			</HTMLContainer>
		);
	}

	indicator(shape) {
		return <rect width={shape.props.w} height={shape.props.h} rx={6} ry={6} />;
	}

	onResize(shape, info) {
		return resizeBox(shape, info);
	}
}
