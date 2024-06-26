

/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
TestTake2AudioProcessorEditor::TestTake2AudioProcessorEditor (TestTake2AudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    // Make sure that before the constructor has finished, you've set the
    // editor's size to whatever you need it to be.
    
    gainSlider.setSliderStyle(juce::Slider::SliderStyle::LinearVertical);
    gainSlider.setTextBoxStyle(juce::Slider::TextBoxAbove, true, 50, 20);
    gainSlider.setRange(0.0f, 1.0f, 0.01f);
    gainSlider.setValue(0.5f);
    gainSlider.addListener(this);
    addAndMakeVisible(gainSlider);
    
    // // Initialize toggle button for pitch shifting
    //     pitchShiftToggle.setButtonText("Pitch Shift");
    //     pitchShiftToggle.addListener(this);
    //     pitchShiftToggle.setToggleState(false, juce::NotificationType::dontSendNotification);
    //     addAndMakeVisible(pitchShiftToggle);
    pitchShiftToggle.setButtonText("Pitch Shift");
    pitchShiftToggle.addListener(this);
    pitchShiftToggle.setToggleState(false, juce::NotificationType::dontSendNotification);
    addAndMakeVisible(pitchShiftToggle);

    setSize(400, 300);
}

TestTake2AudioProcessorEditor::~TestTake2AudioProcessorEditor()
{
}

//==============================================================================
void TestTake2AudioProcessorEditor::paint (juce::Graphics& g)
{
    // (Our component is opaque, so we must completely fill the background with a solid colour)
    g.fillAll (getLookAndFeel().findColour (juce::ResizableWindow::backgroundColourId));

    g.setColour (juce::Colours::white);
    g.setFont (15.0f);
    g.drawFittedText ("Hello World!!!", getLocalBounds(), juce::Justification::centred, 1);
    gainSlider.setBounds(50, getHeight() / 2 - 100, 100, 200);
    
    // Draw toggle button
    pitchShiftToggle.setClickingTogglesState(true);
    pitchShiftToggle.setBounds(150, getHeight() / 2 - 100, 100, 20);
}

void TestTake2AudioProcessorEditor::resized()
{
    // This is generally where you'll want to lay out the positions of any
    // subcomponents in your editor..
}

void TestTake2AudioProcessorEditor::sliderValueChanged(juce::Slider *slider) {
    if (slider == &gainSlider) {
        audioProcessor.rawVolume = gainSlider.getValue();
    }
}

void TestTake2AudioProcessorEditor::buttonClicked(juce::Button* button)
{
    if (button == &pitchShiftToggle)
    {
        // Update pitch shift state in the audio processor
        //audioProcessor.setPitchShiftEnabled(pitchShiftToggle.getToggleState());
        audioProcessor.pitchShiftEnabled = pitchShiftToggle.getToggleState();
        //std::cout << "Pitch shift enabled: " << audioProcessor.pitchShiftEnabled << std::endl;
        
    }
}
