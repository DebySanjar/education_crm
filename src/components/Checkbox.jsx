import React from 'react';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 40px;
  cursor: pointer;

  .checkbox-input {
    display: none;
  }

  .checkbox-label {
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    width: 30px;
    height: 30px;
    margin: 0 auto;
    background-color: #f72414;
    transform: translateY(-50%);
    border-radius: 50%;
    cursor: pointer;
    transition: 0.2s ease transform, 0.2s ease background-color, 0.2s ease box-shadow;
    overflow: hidden;
    z-index: 1;
  }

  .checkbox-label:before {
    content: "";
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    width: 24px;
    height: 23px;
    margin: 0 auto;
    background-color: #fff;
    transform: translateY(-50%);
    border-radius: 50%;
    box-shadow: inset 0 7px 10px #ffbeb8;
    transition: 0.2s ease width, 0.2s ease height;
  }

  .checkbox-label:hover:before {
    transform: translateY(-50%) scale(1.1);
    box-shadow: inset 0 7px 10px #ff9d96;
  }

  .checkbox-label:active {
    transform: translateY(-50%) scale(0.9);
  }

  .tick-mark {
    position: absolute;
    top: 0px;
    right: 0;
    left: 0;
    width: 15px;
    height: 18px;
    margin: 0 auto;
    margin-left: 5px;
    transform: rotateZ(-40deg);
  }

  .tick-mark:before, .tick-mark:after {
    content: "";
    position: absolute;
    background-color: #fff;
    border-radius: 2px;
    opacity: 0;
    transition: 0.2s ease transform, 0.2s ease opacity;
  }

  .tick-mark:before {
    left: 0;
    bottom: 0;
    width: 4px;
    height: 10px;
    box-shadow: -2px 0 5px rgba(0,0,0,0.23);
    transform: translateY(-68px)
  }

  .tick-mark:after {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 4px;
    box-shadow: 0 3px 5px rgba(0,0,0,0.23);
    transform: translateX(78px)
  }

  .checkbox-input:checked + .checkbox-label {
    background-color: #07d410;
  }

  .checkbox-input:checked + .checkbox-label:before {
    width: 0;
    height: 0;
  }

  .checkbox-input:checked + .checkbox-label .tick-mark:before,
  .checkbox-input:checked + .checkbox-label .tick-mark:after {
    transform: translate(0);
    opacity: 1;
  }
`;

const Checkbox = ({ checked, onChange, id }) => {
  const checkboxId = `checkbox-${id}`;
  return (
    <StyledWrapper>
      <div>
        <input
          type="checkbox"
          id={checkboxId}
          className="checkbox-input"
          checked={checked}
          onChange={onChange}
        />
        <label htmlFor={checkboxId} className="checkbox-label">
          <div className="tick-mark" />
        </label>
      </div>
    </StyledWrapper>
  );
};

export default Checkbox;
