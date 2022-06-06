import {
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const Banner: React.FC<{ }> = ( ) => {
  const titleText = "Ask Reddit"
	const titleColor = "#ef4444"
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const text = titleText.split(' ').map((t) => ` ${t} `);
	return (
		<>
			<h1
				style={{
					backgroundColor: "white",
					padding: '20px',
					borderRadius: '20px',
					fontFamily: 'Lufga',
					fontWeight: 'bold',
					fontSize: 150,
					textAlign: 'center',
					position: 'absolute',
					top: 0,
					width: '90%',
					left: '5%'
				}}
			>
				{text.map((t, i) => {
					return (
						<span
							key={t}
							style={{
								color: titleColor,
								marginLeft: 10,
								marginRight: 10,
								transform: `scale(${spring({
									fps: videoConfig.fps,
									frame: frame - i * 5,
									config: {
										damping: 100,
										stiffness: 200,
										mass: 0.5,
									},
								})})`,
								display: 'inline-block',
							}}
						>
							{t}
						</span>
					);
				})}
			</h1>
			
		</>
	);
};
