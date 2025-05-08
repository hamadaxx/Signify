import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/fbConfig';
import { fetchVideos } from '../../firebase/vidServices';
import YoutubePlayer from 'react-native-youtube-iframe';

const DailyChallengeScreen = () => {
    const navigation = useNavigation();

    const [videos, setVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [choices, setChoices] = useState([]);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const playerRef = useRef();

    useEffect(() => {
        async function loadChallenge() {
            try {
                const unitsSnapshot = await getDocs(collection(db, 'units'));
                const units = unitsSnapshot.docs.map(doc => ({ id: doc.id }));

                let allVideos = [];

                for (const unit of units) {
                    const unitVideos = await fetchVideos(unit.id);
                    allVideos.push(...unitVideos);
                }

                const shuffledVideos = shuffleArray(allVideos);
                const selected = shuffledVideos.slice(0, 10); // Take 10 random videos

                setVideos(selected);
                setLoading(false);

                if (selected.length > 0) {
                    generateChoices(selected[0], selected);
                }
            } catch (error) {
                console.error('Error loading videos:', error);
                setLoading(false);
            }
        }

        loadChallenge();
    }, []);

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };



    const generateChoices = (correctVideo, allVideos) => {
        let options = [correctVideo];
        while (options.length < 4) {
            const random = allVideos[Math.floor(Math.random() * allVideos.length)];
            if (!options.find(opt => opt.id === random.id)) {
                options.push(random);
            }
        }
        const shuffledOptions = shuffleArray(options).map(option => ({
            title: option.title,
            isCorrect: option.id === correctVideo.id,
        }));
        setChoices(shuffledOptions);
    };

    const handleAnswer = (isCorrect) => {
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        if (currentVideoIndex < videos.length - 1) {
            const nextIndex = currentVideoIndex + 1;
            setCurrentVideoIndex(nextIndex);
            generateChoices(videos[nextIndex], videos);
        } else {
            Alert.alert(
                "Challenge Completed!",
                `🎉 Your Score: ${score + (isCorrect ? 1 : 0)} / ${videos.length}`,
                [
                    { text: "Back to Learn", onPress: () => navigation.navigate('Learn') }
                ]
            );
        }
    };

    const handleQuitChallenge = () => {
        Alert.alert(
            "Quit Challenge",
            "Are you sure you want to quit the challenge?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Quit", style: "destructive", onPress: () => navigation.navigate('Learn') }
            ]
        );
    };

    if (loading || videos.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text>Loading your Daily Challenge...</Text>
            </View>
        );
    }

    const currentVideo = videos[currentVideoIndex];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Header with Quit Button */}
                <View style={styles.header}>
                    <Text style={styles.progressText}>
                        Question {currentVideoIndex + 1} / {videos.length}
                    </Text>

                    <TouchableOpacity 
                        onPress={handleQuitChallenge}>
                        <Text style={styles.quitButtonText}>Quit</Text>
                    </TouchableOpacity>

                </View>
                <View>
                    {/* Score */}
                    <Text style={styles.scoreText}>Score: {score}</Text>
                </View>
                {/* YouTube Video Player */}
                <View style={styles.videoContainer}>
                    <YoutubePlayer
                        height={215}
                        videoId={getYouTubeVideoId(currentVideo.videoURL)}
                        play={false}
                    />
                </View>

                {/* Choices */}
                <View style={styles.choicesContainer}>
                    {choices.map((choice, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.choiceButton,
                                { backgroundColor: index % 2 === 0 ? '#84b1f9' : '#84b1f9' }
                            ]}
                            onPress={() => handleAnswer(choice.isCorrect)}
                        >
                            <Text style={styles.choiceText}>{choice.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>


            </View>
        </SafeAreaView>
    );
};
const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S+\?v=|(?:v|e(?:mbed))\/|\S+&v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',

    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: "#3B82F6"
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    header: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,

    },
    quitButtonText: {
        fontSize: 16,
        color: '#E53935',
        fontWeight: 'bold',
        

    },
  
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 12,
        marginBottom: 25,
        backgroundColor: '#000',
        overflow: 'hidden',
        marginTop: 25,
    },
    choicesContainer: {
        width: '100%',
        marginBottom: 20,
    },
    choiceButton: {
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,

    },
    choiceText: {
        color: '#black',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    progressText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    scoreText: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10


    },
});

export default DailyChallengeScreen;