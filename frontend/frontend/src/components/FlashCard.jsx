import React from 'react';

const FlashCard = ({ title, description, cta = 'Review', onClick }) => {
  return (
    <div
      className="flashcard"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick?.(event);
        }
      }}
    >
      <h3 className="flashcard__title">{title}</h3>
      <p className="flashcard__desc">{description}</p>
      <button type="button" className="flashcard__btn">
        {cta}
      </button>
    </div>
  );
};

export default FlashCard;

